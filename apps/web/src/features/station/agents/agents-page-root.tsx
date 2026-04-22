"use client";

import { useMemo } from "react";
import { getMockDomainActions } from "@/features/mock-domain/actions";
import { useMockDomainStore } from "@/features/mock-domain/store";
import { cn } from "@/lib/utils";

export function AgentsPageRoot() {
  const state = useMockDomainStore((snapshot) => snapshot);
  const actions = useMemo(() => getMockDomainActions(), []);
  const selectedId = state.inspectorSelection?.kind === "agent" ? state.inspectorSelection.id : null;

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Station</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Agents</h1>
      </header>

      <div className="space-y-2">
        {state.agents.map((agent) => (
          <button
            key={agent.id}
            type="button"
            onClick={() => actions.selectInspector({ kind: "agent", id: agent.id })}
            className={cn(
              "w-full rounded-xl border border-border/75 bg-background/80 px-4 py-3 text-left transition-colors",
              selectedId === agent.id
                ? "border-primary/60 bg-primary/10"
                : "hover:bg-muted/40"
            )}
          >
            <p className="text-sm font-medium">{agent.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Status: {agent.status} · Active runs: {agent.activeRuns} · Failure rate: {agent.failureRate}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
