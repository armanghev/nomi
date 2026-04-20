"use client";

import { useState } from "react";
import { ChatScreen } from "@/components/chat/chat-screen";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSend(content: string) {
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

      setConversationId(payload.conversationId ?? conversationId);

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: payload.reply ?? "",
        },
      ]);
    } catch {
      setMessages((current) =>
        current.filter((message) => message.id !== optimisticMessageId)
      );
      setErrorMessage("Couldn't send that message. Try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <ChatScreen
      messages={messages}
      onSend={onSend}
      isSending={isSending}
      errorMessage={errorMessage}
    />
  );
}
