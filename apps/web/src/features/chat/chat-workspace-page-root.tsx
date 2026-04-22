"use client";

import { useMemo } from "react";
import Ai04Composer from "@/components/ai-04";
import { ChatHistorySidebar } from "@/components/chat/chat-history-sidebar";
import { ChatShell } from "@/components/chat/chat-shell";
import { ToolCallRow } from "@/components/ops/tool-call-row";
import { Button } from "@/components/ui/button";
import { getMockDomainActions } from "@/features/mock-domain/actions";
import { useMockDomainStore } from "@/features/mock-domain/store";
import type {
  ConversationAttachment,
  ConversationMessage,
} from "@/features/mock-domain/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

type ChatWorkspacePageRootProps = {
  conversationId?: string | null;
};

type RenderGroup =
  | {
      kind: "user";
      message: {
        id: string;
        content: string;
        attachments: ConversationAttachment[];
      };
    }
  | {
      kind: "assistant";
      messages: ConversationMessage[];
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

  const getAttachmentExtension = (attachment: ConversationAttachment) => {
    if (attachment.fileExtension) {
      return attachment.fileExtension;
    }

    const extension = attachment.name.split(".").pop();
    if (!extension || extension === attachment.name) {
      return "FILE";
    }

    return extension.toUpperCase();
  };

  const getAttachmentBaseName = (attachment: ConversationAttachment) => {
    const parts = attachment.name.split(".");
    if (parts.length <= 1) {
      return attachment.name;
    }

    return parts.slice(0, -1).join(".") || attachment.name;
  };

  function handleSubmitMessage(
    prompt: string,
    attachments: ConversationAttachment[] = []
  ) {
    const nextConversationId = actions.sendConversationMessage(
      activeConversation?.id ?? null,
      prompt.trim(),
      attachments
    );

    if (conversationId !== nextConversationId) {
      router.push(`/chat/${nextConversationId}`);
    }
  }

  const activeMessages = activeConversation?.messages ?? [];
  const hasMessages = activeMessages.length > 0;
  const messageGroups: RenderGroup[] = activeMessages.reduce<RenderGroup[]>(
    (groups, message) => {
      if (message.role === "user") {
        groups.push({
          kind: "user",
          message: {
            id: message.id,
            content: message.content,
            attachments: message.attachments ?? [],
          },
        });
        return groups;
      }

      const previousGroup = groups[groups.length - 1];
      if (previousGroup?.kind === "assistant") {
        previousGroup.messages.push(message);
        return groups;
      }

      groups.push({
        kind: "assistant",
        messages: [message],
      });
      return groups;
    },
    []
  );

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
              messageGroups.map((group, groupIndex) => {
                if (group.kind === "user") {
                  return (
                    <div key={group.message.id} className="flex w-full justify-end">
                      <div className="flex max-w-[80%] flex-col items-end">
                        {group.message.attachments.length > 0 ? (
                          <div className="mb-2 flex flex-wrap justify-end gap-2">
                            {group.message.attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-3 border-primary/50 bg-primary/80 text-primary-foreground"
                                title={attachment.name}
                              >
                                {attachment.previewUrl ? (
                                  <Image
                                    src={attachment.previewUrl}
                                    alt={attachment.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full flex-col justify-between p-1.5">
                                    <span className="self-start px-1 py-0.5 text-[10px] font-semibold leading-none tracking-wide">
                                      {getAttachmentExtension(attachment)}
                                    </span>
                                    <span className="block overflow-hidden break-all text-[10px] font-semibold leading-tight opacity-95">
                                      {getAttachmentBaseName(attachment)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                        {group.message.content ? (
                          <div className="rounded border-primary/50 bg-primary/80 px-3 py-2 text-primary-foreground">
                            <p className="whitespace-pre-wrap text-sm">
                              {group.message.content}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={`assistant-group-${groupIndex}`} className="flex w-full justify-start">
                    <div className="flex w-full max-w-[80%] items-start gap-2">
                      <Image
                        src="/nomi.png"
                        alt="Nomi"
                        width={40}
                        height={40}
                        className="mt-0.5 h-[40px] w-[40px] shrink-0 object-contain"
                      />
                      <div className="flex w-full min-w-0 flex-col items-stretch justify-start gap-1">
                        {group.messages.map((message) =>
                          message.role === "tool" && message.toolCall ? (
                            <ToolCallRow key={message.id} toolCall={message.toolCall} />
                          ) : (
                            <p key={message.id} className="whitespace-pre-wrap text-sm">
                              {message.content}
                            </p>
                          )
                        )}
                      </div>
                    </div>
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
