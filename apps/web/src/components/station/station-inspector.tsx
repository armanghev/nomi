"use client";

import { useMemo } from "react";
import { ActionRow } from "@/components/ops/action-row";
import { StatusPill } from "@/components/ops/status-pill";
import { getMockDomainActions } from "@/features/mock-domain/actions";
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
  const actions = useMemo(() => getMockDomainActions(), []);
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
        <div className="mt-3">
          <ActionRow
            items={[
              {
                label: "Retry run",
                onClick: () => actions.retryRun(agent.id),
              },
              {
                label: "Rerun context",
                onClick: () => actions.rerunPrompt(state.conversations[0]?.id ?? "unknown"),
              },
            ]}
          />
        </div>
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
        <div className="mt-3">
          <ActionRow
            items={[
              {
                label: "Quick edit",
                onClick: () =>
                  actions.editMemory(memory.id, {
                    value: `${memory.value} (reviewed)`,
                  }),
              },
              {
                label: "Delete",
                variant: "destructive",
                onClick: () => {
                  if (window.confirm("Delete this memory entry?")) {
                    actions.deleteMemory(memory.id);
                  }
                },
              },
            ]}
          />
        </div>
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
        <div className="mt-3">
          <ActionRow
            items={[
              {
                label: "Reconnect",
                onClick: () =>
                  actions.reconnectConnection(connection.id, { shouldFail: false }),
              },
              {
                label: "Disconnect",
                variant: "destructive",
                onClick: () => actions.disconnectConnection(connection.id),
              },
            ]}
          />
        </div>
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
        <div className="mt-3">
          <ActionRow
            items={[
              {
                label: "Pause",
                onClick: () => actions.pauseToken(token.id),
                disabled: token.status !== "active",
              },
              {
                label: "Resume",
                onClick: () => actions.resumeToken(token.id),
                disabled: token.status !== "paused",
              },
              {
                label: "Revoke",
                variant: "destructive",
                onClick: () => actions.revokeToken(token.id),
                disabled: token.status === "revoked",
              },
            ]}
          />
        </div>
      </article>
    );
  }

  const event = state.events.find((item) => item.id === selection.id);
  if (!event) {
    return null;
  }

  const retryAgent =
    state.agents.find((agent) => agent.id === event.entityId) ??
    state.agents.find((agent) => agent.status === "failed" || agent.status === "degraded") ??
    state.agents[0];

  const rerunConversation =
    state.conversations.find((conversation) => conversation.id === event.entityId) ??
    state.conversations[0];

  const eventToken = state.tokens.find((token) => token.id === event.entityId) ?? state.tokens[0];
  const eventMemory =
    state.memories.find((memory) => memory.id === event.entityId) ?? state.memories[0];
  const eventSource =
    state.sources.find((source) => source.id === event.entityId) ?? state.sources[0];

  return (
    <article className="rounded-lg border border-border/70 bg-background/75 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Event</p>
      <p className="mt-2 text-sm font-medium">{event.message}</p>
      <p className="mt-1 text-xs text-muted-foreground">Type: {event.type}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <StatusPill label={event.status} />
        <StatusPill
          label={event.severity}
          tone={event.severity === "critical" ? "critical" : event.severity === "warning" ? "warning" : "muted"}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Created: {formatTimestamp(event.createdAt)}
      </p>

      <div className="mt-3 space-y-2">
        <ActionRow
          items={[
            {
              label: "Ack",
              onClick: () => actions.ackEvent(event.id),
            },
            {
              label: "Resolve",
              onClick: () => actions.resolveEvent(event.id),
            },
          ]}
        />

        <ActionRow
          items={[
            {
              label: "Retry failed run",
              onClick: () => retryAgent && actions.retryRun(retryAgent.id),
              disabled: !retryAgent,
            },
            {
              label: "Re-run prompt",
              onClick: () => rerunConversation && actions.rerunPrompt(rerunConversation.id),
              disabled: !rerunConversation,
            },
          ]}
        />

        <ActionRow
          items={[
            {
              label: eventToken?.status === "paused" ? "Resume token" : "Pause token",
              onClick: () => {
                if (!eventToken) {
                  return;
                }

                if (eventToken.status === "paused") {
                  actions.resumeToken(eventToken.id);
                  return;
                }

                actions.pauseToken(eventToken.id);
              },
              disabled: !eventToken,
            },
            {
              label: "Memory edit",
              onClick: () =>
                eventMemory &&
                actions.editMemory(eventMemory.id, {
                  value: `${eventMemory.value} (inspected from events)`,
                }),
              disabled: !eventMemory,
            },
            {
              label: "Memory delete",
              variant: "destructive",
              onClick: () => {
                if (eventMemory && window.confirm("Delete related memory entry?")) {
                  actions.deleteMemory(eventMemory.id);
                }
              },
              disabled: !eventMemory,
            },
          ]}
        />

        <ActionRow
          items={[
            {
              label: eventSource?.pinned ? "Source unpin" : "Source pin",
              onClick: () => {
                if (!eventSource) {
                  return;
                }

                if (eventSource.pinned) {
                  actions.unpinSource(eventSource.id);
                  return;
                }

                actions.pinSource(eventSource.id);
              },
              disabled: !eventSource,
            },
          ]}
        />
      </div>
    </article>
  );
}
