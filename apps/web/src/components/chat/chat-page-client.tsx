"use client";

import { useState } from "react";
import { ChatScreen } from "@/components/chat/chat-screen";
import type {
  ChatMessage,
  ConversationDetail,
  ConversationSummary,
} from "@/components/chat/types";

type ChatPageClientProps = {
  initialConversations: ConversationSummary[];
  initialConversation: ConversationDetail | null;
};

export function ChatPageClient({
  initialConversations,
  initialConversation,
}: ChatPageClientProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialConversation?.messages ?? []
  );
  const [conversations, setConversations] = useState<ConversationSummary[]>(
    initialConversations
  );
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversation?.id ?? null
  );
  const [activeConversationTitle, setActiveConversationTitle] = useState<
    string | null
  >(initialConversation?.title ?? null);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [deletingConversationId, setDeletingConversationId] = useState<
    string | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conversationsError, setConversationsError] = useState<string | null>(
    null
  );

  async function fetchConversations() {
    setIsLoadingConversations(true);
    setConversationsError(null);

    try {
      const response = await fetch("/api/conversations", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load conversations");
      }

      const payload = (await response.json()) as ConversationSummary[];
      setConversations(payload);

      return payload;
    } catch {
      setConversationsError("Couldn't load saved conversations.");
      throw new Error("Failed to load conversations");
    } finally {
      setIsLoadingConversations(false);
    }
  }

  async function loadConversation(id: string) {
    setIsLoadingConversation(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load conversation");
      }

      const payload = (await response.json()) as ConversationDetail;

      setConversationId(payload.id);
      setActiveConversationTitle(payload.title);
      setMessages(payload.messages);
      setConversations((current) => {
        const existing = current.find(
          (conversation) => conversation.id === payload.id
        );

        if (!existing) {
          return [{ id: payload.id, title: payload.title }, ...current];
        }

        return current.map((conversation) =>
          conversation.id === payload.id
            ? { ...conversation, title: payload.title }
            : conversation
        );
      });
    } catch {
      setErrorMessage("Couldn't load that conversation. Try again.");
    } finally {
      setIsLoadingConversation(false);
    }
  }

  function startNewConversation() {
    setConversationId(null);
    setActiveConversationTitle(null);
    setMessages([]);
    setErrorMessage(null);
  }

  async function handleSend(content: string) {
    const optimisticMessageId = crypto.randomUUID();

    setErrorMessage(null);
    setIsSending(true);
    setMessages((current) => [
      ...current,
      { id: optimisticMessageId, role: "user", content },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const payload = (await response.json()) as {
        conversationId?: string;
        reply?: string;
      };
      const nextConversationId = payload.conversationId ?? conversationId;

      if (nextConversationId) {
        setConversationId(nextConversationId);
        setActiveConversationTitle((current) => current ?? content);
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: payload.reply ?? "",
        },
      ]);

      if (nextConversationId && !conversationId) {
        setConversations((current) => [
          { id: nextConversationId, title: content },
          ...current,
        ]);
      }

      await fetchConversations();
    } catch {
      setMessages((current) =>
        current.filter((message) => message.id !== optimisticMessageId)
      );
      setErrorMessage("Couldn't send that message. Try again.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleDeleteConversation(id: string) {
    setDeletingConversationId(id);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      const remainingConversations = conversations.filter(
        (conversation) => conversation.id !== id
      );

      setConversations(remainingConversations);

      if (conversationId === id) {
        if (remainingConversations[0]) {
          await loadConversation(remainingConversations[0].id);
        } else {
          startNewConversation();
        }
      }
    } catch {
      setErrorMessage("Couldn't delete that conversation. Try again.");
    } finally {
      setDeletingConversationId(null);
    }
  }

  return (
    <ChatScreen
      messages={messages}
      conversations={conversations}
      activeConversationId={conversationId}
      activeConversationTitle={activeConversationTitle}
      onSend={handleSend}
      onSelectConversation={loadConversation}
      onDeleteConversation={handleDeleteConversation}
      onStartNewConversation={startNewConversation}
      isSending={isSending}
      isLoadingConversation={isLoadingConversation}
      isLoadingConversations={isLoadingConversations}
      deletingConversationId={deletingConversationId}
      errorMessage={errorMessage}
      conversationsError={conversationsError}
    />
  );
}
