"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MetricTile } from "@/components/ops/metric-tile";
import { StatusPill } from "@/components/ops/status-pill";
import { Button } from "@/components/ui/button";
import { getMockDomainActions } from "@/features/mock-domain/actions";
import {
  selectDashboardSummary,
  selectRecentFailureEvents,
} from "@/features/mock-domain/selectors";
import { useMockDomainStore } from "@/features/mock-domain/store";
import type { DashboardMetricId } from "@/features/mock-domain/types";

const metricDefinitions: {
  id: DashboardMetricId;
  label: string;
  format: (value: ReturnType<typeof selectDashboardSummary>) => string;
  caption: (value: ReturnType<typeof selectDashboardSummary>) => string;
}[] = [
  {
    id: "criticalEvents",
    label: "Critical events",
    format: (value) => String(value.criticalEvents),
    caption: (value) => `${value.failedEvents} failed in timeline`,
  },
  {
    id: "activeAgents",
    label: "Active agents",
    format: (value) => String(value.activeAgents),
    caption: () => "Healthy or currently running",
  },
  {
    id: "pausedTokens",
    label: "Paused tokens",
    format: (value) => String(value.pausedTokens),
    caption: () => "Credential operations requiring review",
  },
  {
    id: "avgLatencyMs",
    label: "Avg latency",
    format: (value) => `${value.avgLatencyMs}ms`,
    caption: () => "Across latest model runs",
  },
  {
    id: "dailyCostUsd",
    label: "Daily token cost",
    format: (value) => `$${value.dailyCostUsd}`,
    caption: (value) => `${value.retryingEvents} retries in progress`,
  },
];

function toneFromAgentStatus(status: string) {
  if (status === "healthy") {
    return "success" as const;
  }

  if (status === "degraded") {
    return "warning" as const;
  }

  if (status === "failed") {
    return "critical" as const;
  }

  return "muted" as const;
}

function shortTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DashboardPageRoot() {
  const state = useMockDomainStore((snapshot) => snapshot);
  const actions = useMemo(() => getMockDomainActions(), []);
  const summary = useMemo(() => selectDashboardSummary(state), [state]);
  const recentFailures = useMemo(() => selectRecentFailureEvents(state, 5), [state]);

  const selectedMetricId =
    state.inspectorSelection?.kind === "dashboard-metric"
      ? state.inspectorSelection.id
      : null;

  const latestRuns = [...state.modelRuns]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  const costTrend = latestRuns.reduce((sum, run) => sum + run.costUsd, 0);
  const latencyTrend =
    latestRuns.length === 0
      ? 0
      : Math.round(
          latestRuns.reduce((sum, run) => sum + run.latencyMs, 0) / latestRuns.length
        );

  return (
    <section className="space-y-5">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Station
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Global health and triage queue across Nomi runtime surfaces.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metricDefinitions.map((metric) => (
          <MetricTile
            key={metric.id}
            label={metric.label}
            value={metric.format(summary)}
            caption={metric.caption(summary)}
            emphasized={selectedMetricId === metric.id}
            onClick={() =>
              actions.selectInspector({ kind: "dashboard-metric", id: metric.id })
            }
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="rounded-xl border border-border/75 bg-background/80 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Health summary</h2>
            <StatusPill
              tone={summary.criticalEvents > 0 ? "warning" : "success"}
              label={summary.criticalEvents > 0 ? "attention needed" : "stable"}
            />
          </div>

          <div className="mt-3 space-y-2">
            {state.agents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => actions.selectInspector({ kind: "agent", id: agent.id })}
                className="flex w-full items-center justify-between rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-left hover:bg-muted/40"
              >
                <div>
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Last run {agent.lastRunStatus} at {shortTime(agent.lastRunAt)}
                  </p>
                </div>
                <StatusPill tone={toneFromAgentStatus(agent.status)} label={agent.status} />
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-border/75 bg-background/80 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Recent failures and retries</h2>
            <Link href="/station/events" className="text-xs text-primary underline-offset-2 hover:underline">
              Open Events
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {recentFailures.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active incidents.</p>
            ) : (
              recentFailures.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => actions.selectInspector({ kind: "event", id: event.id })}
                  className="w-full rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-left hover:bg-muted/40"
                >
                  <p className="text-sm font-medium">{event.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.type} · {event.status}
                  </p>
                </button>
              ))
            )}
          </div>
        </article>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <MetricTile
          label="Latency trend"
          value={`${latencyTrend}ms`}
          caption="Last three model runs"
        />
        <MetricTile
          label="Cost trend"
          value={`$${costTrend.toFixed(3)}`}
          caption="Last three model runs"
        />
      </div>

      <article className="rounded-xl border border-border/75 bg-background/80 p-4">
        <h2 className="text-sm font-semibold">Quick actions</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Jump directly into the operator workflows that mutate shared state.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/station/tokens">Token controls</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/station/connections">Connection lifecycle</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/station/events">Incident timeline</Link>
          </Button>
        </div>
      </article>
    </section>
  );
}
