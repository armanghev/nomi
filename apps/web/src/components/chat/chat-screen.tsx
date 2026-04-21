"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LoaderCircleIcon,
  MenuIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Ai04Composer from "@/components/ai-04";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { ChatMessage, ConversationSummary } from "./types";

type ChatScreenProps = {
  messages: ChatMessage[];
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  activeConversationTitle?: string | null;
  isSending: boolean;
  isLoadingConversation: boolean;
  isLoadingConversations: boolean;
  onSend: (content: string) => Promise<void>;
  onSelectConversation: (id: string) => Promise<void>;
  onDeleteConversation: (id: string) => Promise<void>;
  onStartNewConversation: () => void;
  errorMessage?: string | null;
  conversationsError?: string | null;
  deletingConversationId?: string | null;
};

function EmptyAssistantBubble() {
  return (
    <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-border/70 bg-background/75 px-5 py-4 text-center">
      <p className="text-sm font-medium">What do you want to work on?</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Start a thread and Nomi will keep it persistent in history.
      </p>
    </div>
  );
}

type ConversationListProps = {
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  isLoadingConversations: boolean;
  deletingConversationId?: string | null;
  onSelectConversation: (id: string) => Promise<void>;
  onDeleteConversation: (id: string) => Promise<void>;
  onStartNewConversation: () => void;
  conversationsError?: string | null;
};

function ConversationList({
  conversations,
  activeConversationId,
  isLoadingConversations,
  deletingConversationId,
  onSelectConversation,
  onDeleteConversation,
  onStartNewConversation,
  conversationsError,
}: ConversationListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/70 p-3">
        <Button
          type="button"
          onClick={onStartNewConversation}
          className="h-9 w-full justify-start gap-2 rounded-lg"
        >
          <PlusIcon className="size-4" />
          New chat
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-2 py-3">
        {isLoadingConversations ? (
          <div className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground">
            <LoaderCircleIcon className="size-4 animate-spin" />
            Loading history...
          </div>
        ) : conversations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 px-3 py-4 text-sm text-muted-foreground">
            No conversations yet.
          </div>
        ) : (
          conversations.map((conversation) => {
            const isActive = activeConversationId === conversation.id;
            const isDeleting = deletingConversationId === conversation.id;

            return (
              <div
                key={conversation.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg border px-2 py-2 transition-colors",
                  isActive
                    ? "border-foreground/15 bg-foreground/5"
                    : "border-transparent hover:bg-muted/60"
                )}
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => void onSelectConversation(conversation.id)}
                >
                  <p className="truncate text-sm">{conversation.title}</p>
                </button>
                <button
                  type="button"
                  className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label={`Delete ${conversation.title}`}
                  disabled={isDeleting}
                  onClick={() => void onDeleteConversation(conversation.id)}
                >
                  {isDeleting ? (
                    <LoaderCircleIcon className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2Icon className="size-3.5" />
                  )}
                </button>
              </div>
            );
          })
        )}

        {conversationsError ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {conversationsError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function ChatScreen({
  messages,
  conversations,
  activeConversationId,
  activeConversationTitle,
  isSending,
  isLoadingConversation,
  isLoadingConversations,
  onSend,
  onSelectConversation,
  onDeleteConversation,
  onStartNewConversation,
  errorMessage,
  conversationsError,
  deletingConversationId,
}: ChatScreenProps) {
  const [value, setValue] = useState("");
  const canSend =
    value.trim().length > 0 && !isSending && !isLoadingConversation;
  const headerTitle = activeConversationTitle?.trim() || "New chat";

  return (
    <div className="grid min-h-[calc(100svh-11rem)] gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden min-h-0 rounded-2xl border border-border/70 bg-background/72 lg:block">
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          isLoadingConversations={isLoadingConversations}
          deletingConversationId={deletingConversationId}
          onSelectConversation={onSelectConversation}
          onDeleteConversation={onDeleteConversation}
          onStartNewConversation={onStartNewConversation}
          conversationsError={conversationsError}
        />
      </aside>

      <section className="flex min-h-0 flex-col rounded-2xl border border-border/70 bg-background/72">
        <header className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Conversation
            </p>
            <h1 className="truncate text-base font-medium sm:text-lg">{headerTitle}</h1>
          </div>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 lg:hidden"
                />
              }
            >
              <MenuIcon className="size-4" />
              History
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs p-0">
              <SheetHeader className="border-b border-border/70 p-4">
                <SheetTitle>Conversation history</SheetTitle>
              </SheetHeader>
              <ConversationList
                conversations={conversations}
                activeConversationId={activeConversationId}
                isLoadingConversations={isLoadingConversations}
                deletingConversationId={deletingConversationId}
                onSelectConversation={onSelectConversation}
                onDeleteConversation={onDeleteConversation}
                onStartNewConversation={onStartNewConversation}
                conversationsError={conversationsError}
              />
            </SheetContent>
          </Sheet>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
            {isLoadingConversation ? (
              <div className="rounded-xl border border-border/75 bg-background/86 px-4 py-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <LoaderCircleIcon className="size-4 animate-spin" />
                  Loading conversation...
                </div>
              </div>
            ) : messages.length === 0 ? (
              <EmptyAssistantBubble />
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((message, index) => {
                  const isUser = message.role === "user";
                  const isLast = index === messages.length - 1;

                  return (
                    <motion.article
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className={cn("w-full", isUser ? "ml-auto max-w-2xl" : "max-w-3xl")}
                    >
                      <div
                        className={cn(
                          "rounded-2xl border px-4 py-3",
                          isUser
                            ? "ml-auto border-foreground/15 bg-foreground text-background"
                            : "border-border/75 bg-background/88"
                        )}
                      >
                        <p className="mb-2 text-[11px] uppercase tracking-[0.18em] opacity-70">
                          {isUser ? "You" : "Nomi"}
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-6 sm:text-[0.95rem]">
                          {message.content}
                        </p>
                        {isLast && isSending ? (
                          <div className="mt-3 flex items-center gap-2 text-xs opacity-75">
                            <LoaderCircleIcon className="size-3.5 animate-spin" />
                            Generating response...
                          </div>
                        ) : null}
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        <div className="border-t border-border/70 bg-background/86 px-4 py-4">
          <div className="mx-auto w-full max-w-3xl">
            {errorMessage ? (
              <p
                className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                role="status"
                aria-live="polite"
              >
                {errorMessage}
              </p>
            ) : null}

            <div className="animate-in fade-in-30 slide-in-from-bottom-2 duration-300">
              <Ai04Composer
                disabled={isSending || isLoadingConversation}
                onSubmit={() => {
                  if (canSend) {
                    void onSend(value.trim());
                    setValue("");
                  }
                }}
                onValueChange={setValue}
                value={value}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
