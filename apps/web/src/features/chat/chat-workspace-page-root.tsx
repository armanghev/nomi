"use client";

import { useMemo, useState } from "react";
import Ai04Composer from "@/components/ai-04";
import { ChatHistorySidebar } from "@/components/chat/chat-history-sidebar";
import { ChatShell } from "@/components/chat/chat-shell";
import { getMockDomainActions } from "@/features/mock-domain/actions";
import { useMockDomainStore } from "@/features/mock-domain/store";
import { cn } from "@/lib/utils";

export function ChatWorkspacePageRoot() {
  const state = useMockDomainStore((snapshot) => snapshot);
  const actions = useMemo(() => getMockDomainActions(), []);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    state.conversations[0]?.id ?? null
  );

  const activeConversation = activeConversationId
    ? state.conversations.find((conversation) => conversation.id === activeConversationId) ??
      null
    : null;

  function handleSubmitMessage(prompt: string) {
    const nextConversationId = actions.sendConversationMessage(
      activeConversation?.id ?? null,
      prompt.trim()
    );
    setActiveConversationId(nextConversationId);
  }

  return (
    <ChatShell
      sidebar={
        <ChatHistorySidebar
          conversations={state.conversations}
          activeConversationId={activeConversation?.id ?? null}
          onSelectConversation={(conversationId) => setActiveConversationId(conversationId)}
          onStartNewConversation={() => setActiveConversationId(null)}
        />
      }
      title={activeConversation?.title || "New Chat"}
    >
        <div className="flex-1 overflow-y-auto px-4 py-5 lg:px-6">
          <div className="space-y-3">
            {activeConversation?.messages.length ? (
              activeConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex w-full", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] px-3 py-2",
                      message.role === "user"
                        ? "rounded border-primary/50 bg-primary/80 text-primary-foreground" : "p-0"
                    )}
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] opacity-75">
                      {message.role === "user" ? "You" : "Nomi"}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{message.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Start a new conversation to begin chatting.</p>
            )}
          </div>
        </div>

        <div className="bg-background/92 p-3 lg:p-4">
          <Ai04Composer onSubmit={handleSubmitMessage} />
        </div>
    </ChatShell>
  );
}
