"use client";

import { useMockDomainStore } from "@/features/mock-domain/store";

export function ConnectionsPageRoot() {
  const connections = useMockDomainStore((state) => state.connections);

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Station</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Connections</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          OAuth-style provider states are mocked in this phase.
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-2">
        {connections.map((connection) => (
          <article
            key={connection.id}
            className="rounded-xl border border-border/75 bg-background/80 px-4 py-3"
          >
            <p className="text-sm font-medium capitalize">{connection.provider}</p>
            <p className="mt-1 text-xs text-muted-foreground">Status: {connection.status}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Scopes: {connection.scopes.join(", ")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
