import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { apiTokens, auditLogs } from "@/db/schema/app";
import { createTokenService } from "@/server/tokens/token-service";

function createRouteTokenService() {
  return createTokenService({
    listTokens: async () => [],
    transaction: async (callback) =>
      db.transaction(async (tx) =>
        callback({
          insertToken: async () => {
            throw new Error("Token creation is not supported in this route");
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

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const service = createRouteTokenService();

  await service.revoke({
    ownerId: session.user.id,
    id
  });

  return NextResponse.json({ revoked: true, id });
}
