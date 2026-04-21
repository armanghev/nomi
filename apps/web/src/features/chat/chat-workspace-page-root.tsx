"use client";

import { useMockDomainStore } from "@/features/mock-domain/store";

export function ChatWorkspacePageRoot() {
  const conversations = useMockDomainStore((state) => state.conversations);
  const latestConversation = conversations[0];

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Chat</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {latestConversation?.title ?? "Conversation"}
        </h1>
      </header>

      <article className="rounded-xl border border-border/75 bg-background/80 p-4">
        <p className="text-sm text-muted-foreground">
          Chat workspace is now route-isolated from Station and backed by shared mock domain state.
        </p>
      </article>
    </section>
  );
}
