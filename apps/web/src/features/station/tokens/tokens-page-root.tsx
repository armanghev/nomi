"use client";

import { useMemo, useState } from "react";
import { ActionRow } from "@/components/ops/action-row";
import { StatusPill } from "@/components/ops/status-pill";
import { Input } from "@/components/ui/input";
import { getMockDomainActions } from "@/features/mock-domain/actions";
import { selectDashboardSummary } from "@/features/mock-domain/selectors";
import { useMockDomainStore } from "@/features/mock-domain/store";
import { cn } from "@/lib/utils";

function statusTone(status: string) {
  if (status === "active") {
    return "success" as const;
  }

  if (status === "paused") {
    return "warning" as const;
  }

  return "critical" as const;
}

function tokenAnomalyTags(token: {
  dailyCostUsd: number;
  anomalyTags: string[];
  lastUsedAt: string | null;
}) {
  const tags = [...token.anomalyTags];

  if (token.lastUsedAt) {
    const hoursSinceUse =
      (Date.now() - new Date(token.lastUsedAt).getTime()) / (1000 * 60 * 60);

    if (hoursSinceUse > 24) {
      tags.push("idle > 24h");
    }
  }

  if (token.dailyCostUsd > 1.5) {
    tags.push("spend spike");
  }

  return [...new Set(tags)];
}

export function TokensPageRoot() {
  const state = useMockDomainStore((snapshot) => snapshot);
  const actions = useMemo(() => getMockDomainActions(), []);
  const summary = useMemo(() => selectDashboardSummary(state), [state]);
  const selectedId =
    state.inspectorSelection?.kind === "token" ? state.inspectorSelection.id : null;

  const selectedToken =
    selectedId == null
      ? state.tokens[0]
      : state.tokens.find((token) => token.id === selectedId) ?? state.tokens[0];

  const [label, setLabel] = useState("");
  const [dailyCost, setDailyCost] = useState("0.3");

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Station</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Tokens</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Credential lifecycle controls with immediate dashboard and events sync.
        </p>
      </header>

      <article className="rounded-xl border border-border/75 bg-background/80 p-4">
        <h2 className="text-sm font-semibold">Create token</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_9rem_auto]">
          <Input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Token label"
            aria-label="Token label"
          />
          <Input
            value={dailyCost}
            onChange={(event) => setDailyCost(event.target.value)}
            placeholder="Daily cost"
            aria-label="Daily cost"
          />
          <button
            type="button"
            onClick={() => {
              const next = Number(dailyCost);
              if (!label.trim() || Number.isNaN(next)) {
                return;
              }

              actions.createToken({
                label: label.trim(),
                dailyCostUsd: next,
              });

              setLabel("");
            }}
            className="rounded-lg bg-foreground px-3 py-2 text-sm text-background"
          >
            Create
          </button>
        </div>
      </article>

      <div className="space-y-2">
        {state.tokens.map((token) => {
          const anomalies = tokenAnomalyTags(token);

          return (
            <button
              key={token.id}
              type="button"
              onClick={() => actions.selectInspector({ kind: "token", id: token.id })}
              className={cn(
                "w-full rounded-xl border border-border/75 bg-background/80 px-4 py-3 text-left transition-colors",
                selectedId === token.id
                  ? "border-primary/60 bg-primary/10"
                  : "hover:bg-muted/40"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{token.label}</p>
                <StatusPill tone={statusTone(token.status)} label={token.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Last used: {token.lastUsedAt ? new Date(token.lastUsedAt).toLocaleString() : "never"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Daily cost: ${token.dailyCostUsd}</p>
              {anomalies.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {anomalies.map((tag) => (
                    <StatusPill key={tag} label={tag} tone="warning" />
                  ))}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {selectedToken ? (
        <article className="rounded-xl border border-border/75 bg-background/80 p-4">
          <h2 className="text-sm font-semibold">Token actions</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Paused tokens in dashboard: {summary.pausedTokens}
          </p>
          <div className="mt-3">
            <ActionRow
              items={[
                {
                  label: "Pause",
                  onClick: () => actions.pauseToken(selectedToken.id),
                  disabled: selectedToken.status !== "active",
                },
                {
                  label: "Resume",
                  onClick: () => actions.resumeToken(selectedToken.id),
                  disabled: selectedToken.status !== "paused",
                },
                {
                  label: "Revoke",
                  variant: "destructive",
                  onClick: () => actions.revokeToken(selectedToken.id),
                  disabled: selectedToken.status === "revoked",
                },
              ]}
            />
          </div>
        </article>
      ) : null}
    </section>
  );
}
