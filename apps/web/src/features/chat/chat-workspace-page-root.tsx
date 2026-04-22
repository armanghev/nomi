"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Ai04Composer from "@/components/ai-04";
import { ChatHistorySidebar } from "@/components/chat/chat-history-sidebar";
import { ChatShell } from "@/components/chat/chat-shell";
import { ToolCallRow } from "@/components/ops/tool-call-row";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getMockDomainActions } from "@/features/mock-domain/actions";
import { useMockDomainStore } from "@/features/mock-domain/store";
import type {
  ConversationAttachment,
  ConversationMessage,
} from "@/features/mock-domain/types";
import { cn } from "@/lib/utils";
import { Copy, CopyCheck, Pencil } from "lucide-react";
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

type UserRenderMessage = Extract<RenderGroup, { kind: "user" }>["message"];

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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const copiedResetTimeoutRef = useRef<number | null>(null);

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

  function handleCopyUserMessage(messageId: string, content: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(content);
    }

    if (copiedResetTimeoutRef.current !== null) {
      window.clearTimeout(copiedResetTimeoutRef.current);
    }

    setCopiedMessageId(messageId);
    copiedResetTimeoutRef.current = window.setTimeout(() => {
      setCopiedMessageId(null);
      copiedResetTimeoutRef.current = null;
    }, 1_000);
  }

  function handleStartEditMessage(message: UserRenderMessage) {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  }

  function handleCancelEdit() {
    setEditingMessageId(null);
    setEditingContent("");
  }

  function handleSaveEditedMessage(message: UserRenderMessage) {
    if (!activeConversation) {
      return;
    }

    const nextConversationId = actions.editConversationMessage(
      activeConversation.id,
      message.id,
      editingContent.trim(),
      message.attachments
    );

    handleCancelEdit();
    if (nextConversationId && conversationId !== nextConversationId) {
      router.push(`/chat/${nextConversationId}`);
    }
  }

  useEffect(() => {
    setEditingMessageId(null);
    setEditingContent("");
    setCopiedMessageId(null);

    if (copiedResetTimeoutRef.current !== null) {
      window.clearTimeout(copiedResetTimeoutRef.current);
      copiedResetTimeoutRef.current = null;
    }
  }, [activeConversation?.id]);

  useEffect(
    () => () => {
      if (copiedResetTimeoutRef.current !== null) {
        window.clearTimeout(copiedResetTimeoutRef.current);
      }
    },
    []
  );

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
                  const isEditing = editingMessageId === group.message.id;
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
                        {isEditing ? (
                          <div className="w-full rounded border border-primary/50 bg-primary/80 p-2 text-primary-foreground">
                            <Textarea
                              aria-label="Edit user message"
                              value={editingContent}
                              onChange={(event) => setEditingContent(event.target.value)}
                              className="min-h-24 resize-y border-primary-foreground/35 bg-primary-foreground/7 text-sm text-primary-foreground placeholder:text-primary-foreground/70"
                            />
                            <div className="mt-2 flex justify-end gap-1">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                aria-label="Cancel edit"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                aria-label="Save edit"
                                onClick={() => handleSaveEditedMessage(group.message)}
                                disabled={editingContent.trim().length === 0}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : group.message.content ? (
                          <div className="rounded border-primary/50 bg-primary/80 px-3 py-2 text-primary-foreground">
                            <p className="whitespace-pre-wrap text-sm">
                              {group.message.content}
                            </p>
                          </div>
                        ) : null}
                        {!isEditing ? (
                          <div className="mt-1 flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              aria-label="Copy message"
                              onClick={() =>
                                handleCopyUserMessage(
                                  group.message.id,
                                  group.message.content
                                )
                              }
                            >
                              {copiedMessageId === group.message.id ? (
                                <CopyCheck className="size-4" />
                              ) : (
                                <Copy className="size-4" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              aria-label="Edit message"
                              onClick={() => handleStartEditMessage(group.message)}
                            >
                              <Pencil className="size-4" />
                            </Button>
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
