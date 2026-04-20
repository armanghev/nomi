import { and, eq, isNull } from "drizzle-orm";
import { writeAuditLog } from "@/server/audit/audit-log";

type ActiveTokenRecord = {
  id: string;
  ownerId: string;
};

type LookupActiveTokenOwnerIdDependencies = {
  findActiveToken?: (tokenHash: string) => Promise<ActiveTokenRecord | null>;
  markTokenUsed?: (tokenId: string, usedAt: Date) => Promise<void>;
  writeAudit?: typeof writeAuditLog;
  now?: () => Date;
};

export async function lookupActiveTokenOwnerId(
  tokenHash: string,
  deps: LookupActiveTokenOwnerIdDependencies = {}
) {
  const findActiveToken =
    deps.findActiveToken ??
    (async (hashedToken: string) => {
      const [{ db }, { apiTokens }] = await Promise.all([
        import("@/db"),
        import("@/db/schema/app")
      ]);
      const [token] = await db
        .select({
          id: apiTokens.id,
          ownerId: apiTokens.ownerId
        })
        .from(apiTokens)
        .where(
          and(
            eq(apiTokens.tokenHash, hashedToken),
            isNull(apiTokens.revokedAt)
          )
        )
        .limit(1);

      return token ?? null;
    });

  const token = await findActiveToken(tokenHash);

  if (!token) {
    return null;
  }

  const usedAt = deps.now?.() ?? new Date();
  const markTokenUsed =
    deps.markTokenUsed ??
    (async (tokenId: string, lastUsedAt: Date) => {
      const [{ db }, { apiTokens }] = await Promise.all([
        import("@/db"),
        import("@/db/schema/app")
      ]);
      await db
        .update(apiTokens)
        .set({ lastUsedAt })
        .where(and(eq(apiTokens.id, tokenId), isNull(apiTokens.revokedAt)));
    });

  await markTokenUsed(token.id, usedAt);

  try {
    await (deps.writeAudit ?? writeAuditLog)({
      ownerId: token.ownerId,
      authMethod: "token",
      action: "token.used",
      resourceType: "api_token",
      resourceId: token.id,
      metadata: {
        tokenHash
      }
    });
  } catch {
    return token.ownerId;
  }

  return token.ownerId;
}
