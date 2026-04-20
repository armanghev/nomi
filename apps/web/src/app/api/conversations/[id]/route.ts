import { NextResponse } from "next/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema/app";
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
      await db.transaction(async (tx) => {
        const [conversation] = await tx
          .select({
            id: conversations.id
          })
          .from(conversations)
          .where(and(eq(conversations.ownerId, ownerId), eq(conversations.id, id)))
          .limit(1);

        if (!conversation) {
          return;
        }

        await tx.delete(messages).where(eq(messages.conversationId, id));
        await tx
          .delete(conversations)
          .where(and(eq(conversations.ownerId, ownerId), eq(conversations.id, id)));
      });
    }
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const requestAuth = await resolveRequestAuth(request, {
    lookupTokenOwnerId: lookupActiveTokenOwnerId
  });

  if (!requestAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const service = createHistoryRepository();
  const conversation = await service.get(requestAuth.ownerId, id);

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(conversation);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const requestAuth = await resolveRequestAuth(request, {
    lookupTokenOwnerId: lookupActiveTokenOwnerId
  });

  if (!requestAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const service = createHistoryRepository();

  await service.remove(requestAuth.ownerId, id);

  return NextResponse.json({ deleted: true, id });
}
