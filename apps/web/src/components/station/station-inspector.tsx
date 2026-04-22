"use client";

import { useMemo } from "react";
import { selectDashboardSummary } from "@/features/mock-domain/selectors";
import { useMockDomainStore } from "@/features/mock-domain/store";
import type { DashboardMetricId } from "@/features/mock-domain/types";

const dashboardMetricLabels: Record<DashboardMetricId, string> = {
  criticalEvents: "Critical events",
  activeAgents: "Active agents",
  pausedTokens: "Paused tokens",
  avgLatencyMs: "Average latency",
  dailyCostUsd: "Daily token cost",
};

function formatTimestamp(value: string | null) {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleString();
}

export function StationInspector() {
  const state = useMockDomainStore((snapshot) => snapshot);
  const summary = useMemo(() => selectDashboardSummary(state), [state]);
  const selection = state.inspectorSelection;

  if (!selection) {
    return (
      <p className="rounded-lg border border-dashed border-border/70 p-3 text-muted-foreground">
        Select an item to inspect actions and metadata.
      </p>
    );
  }

  if (selection.kind === "dashboard-metric") {
    const label = dashboardMetricLabels[selection.id];

    return (
      <article className="rounded-lg border border-border/70 bg-background/75 p-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Dashboard Metric
        </p>
        <p className="mt-2 text-sm font-medium">{label}</p>
        <p className="mt-1 text-2xl font-semibold">
          {selection.id === "dailyCostUsd"
            ? `$${summary.dailyCostUsd}`
            : selection.id === "avgLatencyMs"
              ? `${summary.avgLatencyMs}ms`
              : summary[selection.id]}
        </p>
      </article>
    );
  }

  if (selection.kind === "agent") {
    const agent = state.agents.find((item) => item.id === selection.id);
    if (!agent) {
      return null;
    }

    return (
      <article className="rounded-lg border border-border/70 bg-background/75 p-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Agent</p>
        <p className="mt-2 text-sm font-medium">{agent.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">Status: {agent.status}</p>
        <p className="mt-1 text-xs text-muted-foreground">Active runs: {agent.activeRuns}</p>
        <p className="mt-1 text-xs text-muted-foreground">Failure rate: {agent.failureRate}</p>
      </article>
    );
  }

  if (selection.kind === "memory") {
    const memory = state.memories.find((item) => item.id === selection.id);
    if (!memory) {
      return null;
    }

    return (
      <article className="rounded-lg border border-border/70 bg-background/75 p-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Memory</p>
        <p className="mt-2 text-sm font-medium">{memory.label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{memory.value}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Updated: {formatTimestamp(memory.updatedAt)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Sources: {memory.sourceCount}</p>
      </article>
    );
  }

  if (selection.kind === "connection") {
    const connection = state.connections.find((item) => item.id === selection.id);
    if (!connection) {
      return null;
    }

    return (
      <article className="rounded-lg border border-border/70 bg-background/75 p-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Connection</p>
        <p className="mt-2 text-sm font-medium capitalize">{connection.provider}</p>
        <p className="mt-1 text-xs text-muted-foreground">Status: {connection.status}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Scopes: {connection.scopes.join(", ")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Last sync: {formatTimestamp(connection.lastSyncAt)}
        </p>
      </article>
    );
  }

  if (selection.kind === "token") {
    const token = state.tokens.find((item) => item.id === selection.id);
    if (!token) {
      return null;
    }

    return (
      <article className="rounded-lg border border-border/70 bg-background/75 p-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Token</p>
        <p className="mt-2 text-sm font-medium">{token.label}</p>
        <p className="mt-1 text-xs text-muted-foreground">Status: {token.status}</p>
        <p className="mt-1 text-xs text-muted-foreground">Daily cost: ${token.dailyCostUsd}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Last used: {formatTimestamp(token.lastUsedAt)}
        </p>
      </article>
    );
  }

  const event = state.events.find((item) => item.id === selection.id);
  if (!event) {
    return null;
  }

  return (
    <article className="rounded-lg border border-border/70 bg-background/75 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Event</p>
      <p className="mt-2 text-sm font-medium">{event.message}</p>
      <p className="mt-1 text-xs text-muted-foreground">Type: {event.type}</p>
      <p className="mt-1 text-xs text-muted-foreground">Status: {event.status}</p>
      <p className="mt-1 text-xs text-muted-foreground">Severity: {event.severity}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Created: {formatTimestamp(event.createdAt)}
      </p>
    </article>
  );
}
