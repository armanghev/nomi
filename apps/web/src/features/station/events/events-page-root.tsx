"use client";

import { useMemo } from "react";
import { getMockDomainActions } from "@/features/mock-domain/actions";
import { useMockDomainStore } from "@/features/mock-domain/store";
import { cn } from "@/lib/utils";

export function EventsPageRoot() {
  const state = useMockDomainStore((snapshot) => snapshot);
  const actions = useMemo(() => getMockDomainActions(), []);
  const selectedId = state.inspectorSelection?.kind === "event" ? state.inspectorSelection.id : null;

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Station</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Events</h1>
      </header>

      <div className="space-y-2">
        {state.events.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => actions.selectInspector({ kind: "event", id: event.id })}
            className={cn(
              "w-full rounded-xl border border-border/75 bg-background/80 px-4 py-3 text-left transition-colors",
              selectedId === event.id
                ? "border-primary/60 bg-primary/10"
                : "hover:bg-muted/40"
            )}
          >
            <p className="text-sm font-medium">{event.message}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {event.type} · {event.status} · {event.severity}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
