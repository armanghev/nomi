"use client";

import { useMemo, useState } from "react";
import { ActionRow } from "@/components/ops/action-row";
import { StatusPill } from "@/components/ops/status-pill";
import { Input } from "@/components/ui/input";
import { getMockDomainActions } from "@/features/mock-domain/actions";
import { useMockDomainStore } from "@/features/mock-domain/store";
import { cn } from "@/lib/utils";

export function MemoriesPageRoot() {
  const state = useMockDomainStore((snapshot) => snapshot);
  const actions = useMemo(() => getMockDomainActions(), []);
  const selectedId =
    state.inspectorSelection?.kind === "memory" ? state.inspectorSelection.id : null;

  const selectedMemory =
    selectedId == null
      ? state.memories[0]
      : state.memories.find((memory) => memory.id === selectedId) ?? state.memories[0];

  const [draftLabel, setDraftLabel] = useState("");
  const [draftValue, setDraftValue] = useState("");

  function beginEdit(memoryId: string) {
    const memory = state.memories.find((item) => item.id === memoryId);
    if (!memory) {
      return;
    }

    actions.selectInspector({ kind: "memory", id: memoryId });
    setDraftLabel(memory.label);
    setDraftValue(memory.value);
  }

  function saveSelectedMemory() {
    if (!selectedMemory) {
      return;
    }

    actions.editMemory(selectedMemory.id, {
      label: draftLabel.trim() || selectedMemory.label,
      value: draftValue.trim() || selectedMemory.value,
    });
  }

  function deleteSelectedMemory() {
    if (!selectedMemory) {
      return;
    }

    const approved = window.confirm("Delete this memory entry?");
    if (!approved) {
      return;
    }

    actions.deleteMemory(selectedMemory.id);
    actions.selectInspector(null);
    setDraftLabel("");
    setDraftValue("");
  }

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Station</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Memories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit persistent memory inventory with full event audit trail.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-2">
          {state.memories.map((memory) => (
            <button
              key={memory.id}
              type="button"
              onClick={() => beginEdit(memory.id)}
              className={cn(
                "w-full rounded-xl border border-border/75 bg-background/80 px-4 py-3 text-left transition-colors",
                selectedId === memory.id
                  ? "border-primary/60 bg-primary/10"
                  : "hover:bg-muted/40"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{memory.label}</p>
                <StatusPill label={memory.provenance} tone="muted" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{memory.value}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Sources used: {memory.sourceCount} · Updated {new Date(memory.updatedAt).toLocaleString()}
              </p>
            </button>
          ))}
        </div>

        <article className="rounded-xl border border-border/75 bg-background/80 p-4">
          <h2 className="text-sm font-semibold">Inline edit</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Saving writes a `memory.update` event and refreshes chat context timestamps.
          </p>

          {selectedMemory ? (
            <div className="mt-3 space-y-3">
              <Input
                value={draftLabel}
                onChange={(event) => setDraftLabel(event.target.value)}
                placeholder="Memory label"
                aria-label="Memory label"
              />
              <Input
                value={draftValue}
                onChange={(event) => setDraftValue(event.target.value)}
                placeholder="Memory value"
                aria-label="Memory value"
              />
              <ActionRow
                items={[
                  {
                    label: "Save changes",
                    variant: "default",
                    onClick: saveSelectedMemory,
                  },
                  {
                    label: "Delete memory",
                    variant: "destructive",
                    onClick: deleteSelectedMemory,
                  },
                ]}
              />
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Select a memory to edit.</p>
          )}
        </article>
      </div>
    </section>
  );
}
