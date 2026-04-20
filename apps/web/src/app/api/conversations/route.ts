import { NextResponse } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { apiTokens, conversations } from "@/db/schema/app";
import { resolveRequestAuth } from "@/server/authz/resolve-request-auth";
import { createHistoryService } from "@/server/history/history-service";

function createHistoryRepository() {
  return createHistoryService({
    listConversations: async (ownerId) => {
      return db
        .select({
          id: conversations.id,
          title: conversations.title
        })
        .from(conversations)
        .where(eq(conversations.ownerId, ownerId))
        .orderBy(desc(conversations.updatedAt));
    },
    loadConversation: async () => null,
    deleteConversation: async () => {
      return;
    }
  });
}

export async function GET(request: Request) {
  const requestAuth = await resolveRequestAuth(request, {
    lookupTokenOwnerId: async (tokenHash) => {
      const [token] = await db
        .select({
          ownerId: apiTokens.ownerId
        })
        .from(apiTokens)
        .where(and(eq(apiTokens.tokenHash, tokenHash), isNull(apiTokens.revokedAt)))
        .limit(1);

      return token?.ownerId ?? null;
    }
  });

  if (!requestAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createHistoryRepository();
  const conversationsList = await service.list(requestAuth.ownerId);

  return NextResponse.json(conversationsList);
}
