"use client";

import { useMemo } from "react";
import { useMockDomainStore } from "@/features/mock-domain/store";
import { selectDashboardSummary } from "@/features/mock-domain/selectors";

export function DashboardPageRoot() {
  const state = useMockDomainStore((snapshot) => snapshot);
  const summary = useMemo(() => selectDashboardSummary(state), [state]);

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Station
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Global health and operator queue across Nomi subsystems.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-xl border border-border/75 bg-background/80 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Critical events</p>
          <p className="mt-2 text-2xl font-semibold">{summary.criticalEvents}</p>
        </article>
        <article className="rounded-xl border border-border/75 bg-background/80 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Active agents</p>
          <p className="mt-2 text-2xl font-semibold">{summary.activeAgents}</p>
        </article>
        <article className="rounded-xl border border-border/75 bg-background/80 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Paused tokens</p>
          <p className="mt-2 text-2xl font-semibold">{summary.pausedTokens}</p>
        </article>
        <article className="rounded-xl border border-border/75 bg-background/80 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Avg latency</p>
          <p className="mt-2 text-2xl font-semibold">{summary.avgLatencyMs}ms</p>
        </article>
        <article className="rounded-xl border border-border/75 bg-background/80 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Daily token cost</p>
          <p className="mt-2 text-2xl font-semibold">${summary.dailyCostUsd}</p>
        </article>
      </div>
    </section>
  );
}
