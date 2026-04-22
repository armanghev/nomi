"use client";

import { useMemo } from "react";
import { ActionRow } from "@/components/ops/action-row";
import { ProviderCard } from "@/components/ops/provider-card";
import { StatusPill } from "@/components/ops/status-pill";
import { ToolCallRow } from "@/components/ops/tool-call-row";
import { getMockDomainActions } from "@/features/mock-domain/actions";
import { useMockDomainStore } from "@/features/mock-domain/store";

const oauthFlowStates = [
  "disconnected",
  "connecting",
  "consent_review",
  "callback_pending",
  "connected",
  "degraded",
  "disconnecting",
  "failed",
] as const;

export function ConnectionsPageRoot() {
  const state = useMockDomainStore((snapshot) => snapshot);
  const actions = useMemo(() => getMockDomainActions(), []);
  const selectedId =
    state.inspectorSelection?.kind === "connection"
      ? state.inspectorSelection.id
      : state.connections[0]?.id;

  const selectedConnection = state.connections.find((item) => item.id === selectedId);
  const selectedConnectionToolCalls = useMemo(
    () =>
      [...state.toolCalls]
        .filter((toolCall) => toolCall.connectionId === selectedConnection?.id)
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [selectedConnection?.id, state.toolCalls]
  );

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Station</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Connections</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          OAuth lifecycle is fully mocked for deterministic operator training.
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-2">
        {state.connections.map((connection) => (
          <ProviderCard
            key={connection.id}
            connection={connection}
            selected={selectedId === connection.id}
            onClick={() => actions.selectInspector({ kind: "connection", id: connection.id })}
            actions={
              <ActionRow
                items={[
                  {
                    label: "Reconnect",
                    onClick: () =>
                      actions.reconnectConnection(connection.id, { shouldFail: false }),
                  },
                  {
                    label: "Reconnect (Fail)",
                    onClick: () =>
                      actions.reconnectConnection(connection.id, { shouldFail: true }),
                    variant: "outline",
                  },
                  {
                    label: "Disconnect",
                    variant: "destructive",
                    onClick: () => {
                      const approved = window.confirm(
                        `Disconnect ${connection.appName} and revoke scopes?`
                      );

                      if (approved) {
                        actions.disconnectConnection(connection.id);
                      }
                    },
                  },
                ]}
              />
            }
          />
        ))}
      </div>

      <article className="rounded-xl border border-border/75 bg-background/80 p-4">
        <h2 className="text-sm font-semibold">OAuth visual flow states</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Transition sequence used by reconnect/disconnect mocks and event timeline.
        </p>

        {selectedConnection ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {oauthFlowStates.map((status) => (
              <StatusPill
                key={status}
                tone={selectedConnection.status === status ? "warning" : "muted"}
                label={status}
              />
            ))}
          </div>
        ) : null}
      </article>

      <article className="rounded-xl border border-border/75 bg-background/80 p-4">
        <h2 className="text-sm font-semibold">Recent tool calls</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Mock execution log for the selected connection and account.
        </p>

        {selectedConnectionToolCalls.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            No tool calls yet for this connection.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {selectedConnectionToolCalls.map((toolCall) => (
              <ToolCallRow key={toolCall.id} toolCall={toolCall} />
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
