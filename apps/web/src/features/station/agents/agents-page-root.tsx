"use client";

import { useMemo } from "react";
import { ActionRow } from "@/components/ops/action-row";
import { StatusPill } from "@/components/ops/status-pill";
import { getMockDomainActions } from "@/features/mock-domain/actions";
import { selectAgentRuns } from "@/features/mock-domain/selectors";
import { useMockDomainStore } from "@/features/mock-domain/store";
import { cn } from "@/lib/utils";

function toTone(status: string) {
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

export function AgentsPageRoot() {
  const state = useMockDomainStore((snapshot) => snapshot);
  const actions = useMemo(() => getMockDomainActions(), []);
  const selectedId =
    state.inspectorSelection?.kind === "agent" ? state.inspectorSelection.id : null;

  const selectedAgent =
    selectedId == null
      ? state.agents[0]
      : state.agents.find((agent) => agent.id === selectedId) ?? state.agents[0];

  const selectedRuns = selectedAgent
    ? selectAgentRuns(state, selectedAgent.id).slice(0, 4)
    : [];

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Station</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Agents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Run operations, failure triage, and rapid retry workflows.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
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
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{agent.name}</p>
                <StatusPill tone={toTone(agent.status)} label={agent.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Active runs: {agent.activeRuns} · Failure rate: {agent.failureRate}
              </p>
            </button>
          ))}
        </div>

        <article className="rounded-xl border border-border/75 bg-background/80 p-4">
          <h2 className="text-sm font-semibold">
            {selectedAgent ? `${selectedAgent.name} timeline` : "Run timeline"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Most recent model runs for this agent.
          </p>

          <div className="mt-3 space-y-2">
            {selectedRuns.map((run) => (
              <div
                key={run.id}
                className="rounded-lg border border-border/70 bg-background/70 px-3 py-2"
              >
                <p className="text-sm font-medium">{run.model}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {run.status} · {run.latencyMs}ms · ${run.costUsd.toFixed(3)}
                </p>
              </div>
            ))}
          </div>

          {selectedAgent ? (
            <div className="mt-4">
              <ActionRow
                items={[
                  {
                    label: "Retry failed run",
                    onClick: () => actions.retryRun(selectedAgent.id),
                  },
                  {
                    label: "Re-run same context",
                    onClick: () =>
                      actions.rerunPrompt(state.conversations[0]?.id ?? "conversation-unknown"),
                  },
                ]}
              />
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
