"use client";

import { useMemo } from "react";
import { getMockDomainActions } from "@/features/mock-domain/actions";
import { useMockDomainStore } from "@/features/mock-domain/store";
import { cn } from "@/lib/utils";

export function ConnectionsPageRoot() {
  const state = useMockDomainStore((snapshot) => snapshot);
  const actions = useMemo(() => getMockDomainActions(), []);
  const selectedId = state.inspectorSelection?.kind === "connection" ? state.inspectorSelection.id : null;

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Station</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Connections</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          OAuth-style provider states are mocked in this phase.
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-2">
        {state.connections.map((connection) => (
          <button
            key={connection.id}
            type="button"
            onClick={() => actions.selectInspector({ kind: "connection", id: connection.id })}
            className={cn(
              "rounded-xl border border-border/75 bg-background/80 px-4 py-3 text-left transition-colors",
              selectedId === connection.id
                ? "border-primary/60 bg-primary/10"
                : "hover:bg-muted/40"
            )}
          >
            <p className="text-sm font-medium capitalize">{connection.provider}</p>
            <p className="mt-1 text-xs text-muted-foreground">Status: {connection.status}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Scopes: {connection.scopes.join(", ")}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
