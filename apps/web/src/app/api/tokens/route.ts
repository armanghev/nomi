import { NextResponse } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { apiTokens, auditLogs } from "@/db/schema/app";
import { createTokenService } from "@/server/tokens/token-service";

const createTokenSchema = z.object({
  label: z.string().min(1)
});

function createRouteTokenService() {
  return createTokenService({
    listTokens: async (ownerId) => {
      const tokens = await db
        .select({
          id: apiTokens.id,
          label: apiTokens.label,
          createdAt: apiTokens.createdAt,
          lastUsedAt: apiTokens.lastUsedAt
        })
        .from(apiTokens)
        .where(and(eq(apiTokens.ownerId, ownerId), isNull(apiTokens.revokedAt)))
        .orderBy(desc(apiTokens.createdAt));

      return tokens.map((token) => ({
        id: token.id,
        label: token.label,
        createdAt: token.createdAt.toISOString(),
        lastUsedAt: token.lastUsedAt?.toISOString() ?? null
      }));
    },
    transaction: async (callback) =>
      db.transaction(async (tx) =>
        callback({
          insertToken: async ({ ownerId, label, tokenHash }) => {
            const [created] = await tx
              .insert(apiTokens)
              .values({ ownerId, label, tokenHash })
              .returning({ id: apiTokens.id });

            if (!created) {
              throw new Error("Failed to create token");
            }

            return created;
          },
          revokeToken: async ({ ownerId, id }) => {
            await tx
              .update(apiTokens)
              .set({ revokedAt: new Date() })
              .where(
                and(
                  eq(apiTokens.ownerId, ownerId),
                  eq(apiTokens.id, id),
                  isNull(apiTokens.revokedAt)
                )
              );
          },
          writeAudit: async (entry) => {
            await tx.insert(auditLogs).values({
              ownerId: entry.ownerId,
              authMethod: entry.authMethod,
              action: entry.action,
              resourceType: entry.resourceType,
              resourceId: entry.resourceId,
              metadata: {}
            });
          }
        })
      )
  });
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createRouteTokenService();
  const tokens = await service.list(session.user.id);

  return NextResponse.json(tokens);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createTokenSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const service = createRouteTokenService();
  const created = await service.create({
    ownerId: session.user.id,
    label: parsed.data.label
  });

  return NextResponse.json(
    {
      id: created.id,
      label: parsed.data.label,
      plaintextToken: created.plaintextToken
    },
    { status: 201 }
  );
}
