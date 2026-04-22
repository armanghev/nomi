"use client";

import { useMemo } from "react";
import Ai04Composer from "@/components/ai-04";
import { ChatHistorySidebar } from "@/components/chat/chat-history-sidebar";
import { ChatShell } from "@/components/chat/chat-shell";
import { Button } from "@/components/ui/button";
import { getMockDomainActions } from "@/features/mock-domain/actions";
import { useMockDomainStore } from "@/features/mock-domain/store";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

type ChatWorkspacePageRootProps = {
  conversationId?: string | null;
};

export function ChatWorkspacePageRoot({
  conversationId = null,
}: ChatWorkspacePageRootProps) {
  const router = useRouter();
  const state = useMockDomainStore((snapshot) => snapshot);
  const actions = useMemo(() => getMockDomainActions(), []);
  const activeConversation = conversationId
    ? state.conversations.find((conversation) => conversation.id === conversationId) ??
      null
    : null;

  function handleSubmitMessage(prompt: string) {
    const nextConversationId = actions.sendConversationMessage(
      activeConversation?.id ?? null,
      prompt.trim()
    );

    if (conversationId !== nextConversationId) {
      router.push(`/chat/${nextConversationId}`);
    }
  }

  const activeMessages = activeConversation?.messages ?? [];
  const hasMessages = activeMessages.length > 0;

  return (
    <ChatShell
      sidebar={
        <ChatHistorySidebar
          conversations={state.conversations}
          activeConversationId={activeConversation?.id ?? null}
          onSelectConversation={(nextConversationId) =>
            router.push(`/chat/${nextConversationId}`)
          }
          onStartNewConversation={() => router.push("/chat")}
        />
      }
      title={activeConversation?.title || "New Chat"}
    >
        <div
          className={cn(
            "flex-1 overflow-y-auto px-4 py-5 lg:px-6",
            hasMessages ? "" : "flex items-center justify-center"
          )}
        >
          <div className={cn("w-full", hasMessages ? "space-y-3" : "max-w-md")}>
            {hasMessages ? (
              activeMessages.map((message) => {
                const isUserMessage = message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={cn("flex w-full", isUserMessage ? "justify-end" : "justify-start")}
                  >
                    {isUserMessage ? (
                      <div className="max-w-[80%] rounded border-primary/50 bg-primary/80 px-3 py-2 text-primary-foreground">
                        <p className="mt-1 whitespace-pre-wrap text-sm">{message.content}</p>
                      </div>
                    ) : (
                      <div className="flex max-w-[80%] items-start gap-2">
                        <Image
                          src="/nomi.png"
                          alt="Nomi"
                          width={40}
                          height={40}
                          className="mt-0.5 h-[40px] w-[40px] shrink-0 object-contain"
                        />
                        <div className="min-w-0">
                          <p className="mt-1 whitespace-pre-wrap text-sm">{message.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="mx-auto flex flex-col items-center px-6 py-10 text-center">
                <Image
                  src="/nomi.png"
                  alt="Nomi"
                  width={100}
                  height={100}
                  className="h-25 w-25 object-contain"
                  priority
                />
                <p className="font-nomi mt-3 text-3xl leading-none text-foreground">nomi</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Start a conversation and I will help you reason, plan, and ship faster.
                </p>
                <Button
                  type="button"
                  className="mt-5"
                  onClick={() =>
                    handleSubmitMessage("Hey Nomi, help me get started with this chat.")
                  }
                >
                  Start with Nomi
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-background/92 p-3 lg:p-4">
          <Ai04Composer onSubmit={handleSubmitMessage} />
        </div>
    </ChatShell>
  );
}
