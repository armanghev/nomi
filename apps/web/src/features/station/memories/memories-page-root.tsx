"use client";

import { useMemo } from "react";
import { getMockDomainActions } from "@/features/mock-domain/actions";
import { useMockDomainStore } from "@/features/mock-domain/store";
import { cn } from "@/lib/utils";

export function MemoriesPageRoot() {
  const state = useMockDomainStore((snapshot) => snapshot);
  const actions = useMemo(() => getMockDomainActions(), []);
  const selectedId = state.inspectorSelection?.kind === "memory" ? state.inspectorSelection.id : null;

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Station</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Memories</h1>
      </header>

      <div className="space-y-2">
        {state.memories.map((memory) => (
          <button
            key={memory.id}
            type="button"
            onClick={() => actions.selectInspector({ kind: "memory", id: memory.id })}
            className={cn(
              "w-full rounded-xl border border-border/75 bg-background/80 px-4 py-3 text-left transition-colors",
              selectedId === memory.id
                ? "border-primary/60 bg-primary/10"
                : "hover:bg-muted/40"
            )}
          >
            <p className="text-sm font-medium">{memory.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{memory.value}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
