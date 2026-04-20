import { NextResponse } from "next/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema/app";
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
    loadConversation: async ({ ownerId, id }) => {
      const [conversation] = await db
        .select({
          id: conversations.id,
          title: conversations.title
        })
        .from(conversations)
        .where(and(eq(conversations.ownerId, ownerId), eq(conversations.id, id)))
        .limit(1);

      if (!conversation) {
        return null;
      }

      const conversationMessages = await db
        .select({
          id: messages.id,
          role: messages.role,
          content: messages.content
        })
        .from(messages)
        .where(eq(messages.conversationId, id))
        .orderBy(asc(messages.createdAt));

      return {
        ...conversation,
        messages: conversationMessages
      };
    },
    deleteConversation: async ({ ownerId, id }) => {
      const [conversation] = await db
        .select({
          id: conversations.id
        })
        .from(conversations)
        .where(and(eq(conversations.ownerId, ownerId), eq(conversations.id, id)))
        .limit(1);

      if (!conversation) {
        return;
      }

      await db.delete(messages).where(eq(messages.conversationId, id));
      await db
        .delete(conversations)
        .where(and(eq(conversations.ownerId, ownerId), eq(conversations.id, id)));
    }
  });
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const service = createHistoryRepository();
  const conversation = await service.get(session.user.id, id);

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(conversation);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const service = createHistoryRepository();

  await service.remove(session.user.id, id);

  return NextResponse.json({ deleted: true, id });
}
