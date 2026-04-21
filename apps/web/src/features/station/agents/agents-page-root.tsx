"use client";

import { useMockDomainStore } from "@/features/mock-domain/store";

export function AgentsPageRoot() {
  const agents = useMockDomainStore((state) => state.agents);

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Station</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Agents</h1>
      </header>

      <div className="space-y-2">
        {agents.map((agent) => (
          <article
            key={agent.id}
            className="rounded-xl border border-border/75 bg-background/80 px-4 py-3"
          >
            <p className="text-sm font-medium">{agent.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Status: {agent.status} · Active runs: {agent.activeRuns} · Failure rate: {agent.failureRate}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
