"use client";

import { useMockDomainStore } from "@/features/mock-domain/store";

export function TokensPageRoot() {
  const tokens = useMockDomainStore((state) => state.tokens);

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Station</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Tokens</h1>
      </header>

      <div className="space-y-2">
        {tokens.map((token) => (
          <article
            key={token.id}
            className="rounded-xl border border-border/75 bg-background/80 px-4 py-3"
          >
            <p className="text-sm font-medium">{token.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Status: {token.status} · Daily cost: ${token.dailyCostUsd}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
