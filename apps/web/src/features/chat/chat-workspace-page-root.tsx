"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Ai04Composer from "@/components/ai-04";
import { ChatHistorySidebar } from "@/components/chat/chat-history-sidebar";
import { ChatShell } from "@/components/chat/chat-shell";
import { StatusPill } from "@/components/ops/status-pill";
import { getMockDomainActions } from "@/features/mock-domain/actions";
import { selectConversationSources } from "@/features/mock-domain/selectors";
import { useMockDomainStore } from "@/features/mock-domain/store";
import { cn } from "@/lib/utils";

export function ChatWorkspacePageRoot() {
  const state = useMockDomainStore((snapshot) => snapshot);
  const actions = useMemo(() => getMockDomainActions(), []);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    state.conversations[0]?.id ?? null
  );
  const [composerValue, setComposerValue] = useState("");

  const activeConversation = activeConversationId
    ? state.conversations.find((conversation) => conversation.id === activeConversationId) ??
      null
    : null;

  const conversationSources = activeConversation
    ? selectConversationSources(state, activeConversation.id)
    : [];

  const relatedEvents = state.events.filter((event) => {
    if (activeConversation && event.entityId === activeConversation.id) {
      return true;
    }

    return conversationSources.some((source) => source.id === event.entityId);
  });

  function toggleSource(sourceId: string, pinned: boolean) {
    if (pinned) {
      actions.unpinSource(sourceId);
      return;
    }

    actions.pinSource(sourceId);
  }

  return (
    <ChatShell
      sidebar={
        <ChatHistorySidebar
          conversations={state.conversations}
          activeConversationId={activeConversation?.id ?? null}
          onSelectConversation={(conversationId) => setActiveConversationId(conversationId)}
          onStartNewConversation={() => setActiveConversationId(null)}
          sources={conversationSources}
          onToggleSourcePin={toggleSource}
        />
      }
    >
      <section className="space-y-4">
        <header>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Chat</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {activeConversation?.title ?? "New conversation"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dedicated chat workspace connected to Station events and source controls.
          </p>
        </header>

        <article className="rounded-xl border border-border/75 bg-background/80 p-4">
          <h2 className="text-sm font-semibold">Message timeline</h2>
          <div className="mt-3 space-y-2">
            {activeConversation?.messages.length ? (
              activeConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "rounded-xl border px-3 py-2",
                    message.role === "user"
                      ? "ml-auto max-w-2xl border-foreground/10 bg-foreground text-background"
                      : "max-w-3xl border-border/70 bg-background/80"
                  )}
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] opacity-75">
                    {message.role === "user" ? "You" : "Nomi"}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Start a new conversation to generate timeline events.
              </p>
            )}
          </div>

          <div className="mt-4">
            <Ai04Composer
              value={composerValue}
              onValueChange={setComposerValue}
              onSubmit={() => {
                if (!composerValue.trim()) {
                  return;
                }

                const nextConversationId = actions.sendConversationMessage(
                  activeConversation?.id ?? null,
                  composerValue.trim()
                );
                setActiveConversationId(nextConversationId);
                setComposerValue("");
              }}
            />
          </div>
        </article>

        <article className="rounded-xl border border-border/75 bg-background/80 p-4">
          <h2 className="text-sm font-semibold">Conversation sources</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {conversationSources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sources pinned for this chat.</p>
            ) : (
              conversationSources.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => toggleSource(source.id, source.pinned)}
                  className="rounded-lg border border-border/70 bg-background px-3 py-1.5 text-xs"
                  aria-label={`${source.pinned ? "Unpin source" : "Pin source"} ${source.label}`}
                >
                  <span>{source.label}</span>
                  <StatusPill
                    className="ml-2"
                    tone={source.pinned ? "success" : "muted"}
                    label={source.pinned ? "pinned" : "unpinned"}
                  />
                </button>
              ))
            )}
          </div>
        </article>

        <article className="rounded-xl border border-border/75 bg-background/80 p-4">
          <h2 className="text-sm font-semibold">Linked station events</h2>
          <div className="mt-3 space-y-2">
            {relatedEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No related events yet.</p>
            ) : (
              relatedEvents.slice(0, 6).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2"
                >
                  <div>
                    <p className="text-sm">{event.message}</p>
                    <p className="text-xs text-muted-foreground">{event.type}</p>
                  </div>
                  <Link href="/station/events" className="text-xs text-primary hover:underline">
                    Open
                  </Link>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </ChatShell>
  );
}
