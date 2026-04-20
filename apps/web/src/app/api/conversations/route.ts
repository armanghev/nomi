import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { conversations } from "@/db/schema/app";
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

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createHistoryRepository();
  const conversationsList = await service.list(session.user.id);

  return NextResponse.json(conversationsList);
}
