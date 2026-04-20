import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversations } from "@/db/schema/app";
import { resolveRequestAuth } from "@/server/authz/resolve-request-auth";
import { lookupActiveTokenOwnerId } from "@/server/authz/token-auth";
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
    lookupTokenOwnerId: lookupActiveTokenOwnerId
  });

  if (!requestAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createHistoryRepository();
  const conversationsList = await service.list(requestAuth.ownerId);

  return NextResponse.json(conversationsList);
}
