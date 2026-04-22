"use client";

import { useMemo } from "react";
import { getMockDomainActions } from "@/features/mock-domain/actions";
import { selectDashboardSummary } from "@/features/mock-domain/selectors";
import { useMockDomainStore } from "@/features/mock-domain/store";
import type { DashboardMetricId } from "@/features/mock-domain/types";
import { cn } from "@/lib/utils";

const metricDefinitions: {
  id: DashboardMetricId;
  label: string;
  format: (value: ReturnType<typeof selectDashboardSummary>) => string;
}[] = [
  {
    id: "criticalEvents",
    label: "Critical events",
    format: (value) => String(value.criticalEvents),
  },
  {
    id: "activeAgents",
    label: "Active agents",
    format: (value) => String(value.activeAgents),
  },
  {
    id: "pausedTokens",
    label: "Paused tokens",
    format: (value) => String(value.pausedTokens),
  },
  {
    id: "avgLatencyMs",
    label: "Avg latency",
    format: (value) => `${value.avgLatencyMs}ms`,
  },
  {
    id: "dailyCostUsd",
    label: "Daily token cost",
    format: (value) => `$${value.dailyCostUsd}`,
  },
];

export function DashboardPageRoot() {
  const state = useMockDomainStore((snapshot) => snapshot);
  const summary = useMemo(() => selectDashboardSummary(state), [state]);
  const selectedMetricId =
    state.inspectorSelection?.kind === "dashboard-metric"
      ? state.inspectorSelection.id
      : null;

  const actions = useMemo(() => getMockDomainActions(), []);

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
        {metricDefinitions.map((metric) => (
          <button
            key={metric.id}
            type="button"
            onClick={() =>
              actions.selectInspector({ kind: "dashboard-metric", id: metric.id })
            }
            className={cn(
              "rounded-xl border border-border/75 bg-background/80 p-4 text-left transition-colors",
              selectedMetricId === metric.id
                ? "border-primary/60 bg-primary/10"
                : "hover:bg-muted/40"
            )}
          >
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{metric.format(summary)}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
