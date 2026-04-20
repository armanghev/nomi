"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatScreenProps = {
  messages: ChatMessage[];
  isSending: boolean;
  onSend: (content: string) => Promise<void>;
  errorMessage?: string | null;
};

export function ChatScreen({
  messages,
  isSending,
  onSend,
  errorMessage,
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
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 px-4 py-5 sm:px-6 lg:px-8">
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
        <div className="mx-auto flex h-full w-full max-w-4xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <section className="flex-1 space-y-3">
            {messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-5 py-6 text-sm text-muted-foreground">
                Ask a question to start the conversation.
              </div>
            ) : (
              messages.map((message) => (
                <article
                  key={message.id}
                  className="max-w-3xl rounded-2xl border bg-card px-4 py-3 shadow-sm"
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
          </section>

          {errorMessage ? (
            <p
              className="mt-4 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              role="status"
              aria-live="polite"
            >
              {errorMessage}
            </p>
          ) : null}
        </div>
      </main>

      <form
        className="border-t border-border/70 bg-background/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8"
        onSubmit={handleSubmit}
      >
        <div className="mx-auto flex w-full max-w-4xl gap-3">
          <input
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Ask Nomi anything"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={isSending}
          />
          <Button type="submit" disabled={isSending} className="px-5">
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
