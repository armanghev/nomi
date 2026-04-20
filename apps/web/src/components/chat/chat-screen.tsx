"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    await onSend(trimmed);
    setValue("");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Protected workspace
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Chat with Nomi
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                A private surface for the owner account.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto grid h-full w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
          <aside className="rounded-3xl border border-border/80 bg-card/60 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Saved threads
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">
                  History
                </h2>
              </div>
              <Button type="button" variant="outline" onClick={onStartNewConversation}>
                New chat
              </Button>
            </div>

            {conversationsError ? (
              <p
                className="mt-4 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                role="status"
                aria-live="polite"
              >
                {conversationsError}
              </p>
            ) : null}

            <div className="mt-4 space-y-2">
              {isLoadingConversations ? (
                <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                  Loading saved conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                  Saved conversations will appear here after you send a message.
                </div>
              ) : (
                conversations.map((conversation) => {
                  const isActive = conversation.id === activeConversationId;
                  const isDeleting = deletingConversationId === conversation.id;

                  return (
                    <div
                      key={conversation.id}
                      className={`flex items-start gap-2 rounded-2xl border px-2 py-2 transition-colors ${
                        isActive
                          ? "border-primary/30 bg-primary/5"
                          : "border-border/70 bg-background/80"
                      }`}
                    >
                      <button
                        type="button"
                        className="flex-1 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted"
                        onClick={() => onSelectConversation(conversation.id)}
                        disabled={isLoadingConversation && isActive}
                      >
                        {conversation.title}
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete ${conversation.title}`}
                        disabled={isDeleting}
                        onClick={async () => {
                          const shouldDelete = window.confirm(
                            `Delete "${conversation.title}"? This cannot be undone.`
                          );

                          if (!shouldDelete) {
                            return;
                          }

                          await onDeleteConversation(conversation.id);
                        }}
                      >
                        {isDeleting ? "..." : "Delete"}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          <section className="flex min-h-[480px] flex-col rounded-3xl border border-border/80 bg-card/50 shadow-sm">
            <div className="border-b border-border/70 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                {activeConversationId ? "Open thread" : "New thread"}
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                {activeConversationTitle ?? "Start a fresh conversation"}
              </h2>
            </div>

            <div className="flex-1 space-y-3 px-5 py-5">
              {isLoadingConversation ? (
                <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-5 py-6 text-sm text-muted-foreground">
                  Loading conversation...
                </div>
              ) : messages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-5 py-6 text-sm text-muted-foreground">
                  Ask a question to start the conversation.
                </div>
              ) : (
                messages.map((message) => (
                  <article
                    key={message.id}
                    className="max-w-3xl rounded-2xl border bg-background px-4 py-3 shadow-sm"
                  >
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      {message.role}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap leading-6">
                      {message.content}
                    </p>
                  </article>
                ))
              )}
            </div>

            {errorMessage ? (
              <p
                className="mx-5 mb-5 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                role="status"
                aria-live="polite"
              >
                {errorMessage}
              </p>
            ) : null}
          </section>
        </div>
      </main>

      <form
        className="border-t border-border/70 bg-background/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8"
        onSubmit={handleSubmit}
      >
        <div className="mx-auto flex w-full max-w-6xl gap-3">
          <input
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Ask Nomi anything"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={isSending || isLoadingConversation}
          />
          <Button
            type="submit"
            disabled={isSending || isLoadingConversation}
            className="px-5"
          >
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
