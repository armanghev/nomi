import { and, asc, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema/app";
import { ChatPageClient } from "@/components/chat/chat-page-client";
import type {
  ConversationDetail,
  ConversationSummary,
} from "@/components/chat/types";

async function loadInitialConversations(ownerId: string) {
  return db
    .select({
      id: conversations.id,
      title: conversations.title,
    })
    .from(conversations)
    .where(eq(conversations.ownerId, ownerId))
    .orderBy(desc(conversations.updatedAt));
}

async function loadConversation(
  ownerId: string,
  id: string
): Promise<ConversationDetail | null> {
  const [conversation] = await db
    .select({
      id: conversations.id,
      title: conversations.title,
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
      content: messages.content,
    })
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  return {
    ...conversation,
    messages: conversationMessages.map((message) => ({
      ...message,
      role: message.role === "assistant" ? "assistant" : "user",
    })),
  };
}

export default async function ChatPage() {
  const session = await auth();
  const ownerId = session?.user?.id;

  if (!ownerId) {
    return (
      <ChatPageClient
        initialConversations={[]}
        initialConversation={null}
      />
    );
  }

  const initialConversations = (await loadInitialConversations(
    ownerId
  )) satisfies ConversationSummary[];
  const initialConversation = initialConversations[0]
    ? await loadConversation(ownerId, initialConversations[0].id)
    : null;

  return (
    <ChatPageClient
      initialConversations={initialConversations}
      initialConversation={initialConversation}
    />
  );
}
