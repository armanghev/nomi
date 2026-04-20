"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

type MemoryItem = {
  id: string;
  label: string;
  value: string;
};

type MemorySettingsPanelProps = {
  initialItems: MemoryItem[];
};

export function MemorySettingsPanel({
  initialItems,
}: MemorySettingsPanelProps) {
  const [items, setItems] = useState<MemoryItem[]>(initialItems);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedLabel = label.trim();
    const trimmedValue = value.trim();

    if (!trimmedLabel || !trimmedValue) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: trimmedLabel,
          value: trimmedValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create memory");
      }

      const created = (await response.json()) as MemoryItem;
      setItems((current) => [created, ...current]);
      setLabel("");
      setValue("");
    } catch {
      setErrorMessage("Couldn't save that memory item.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string, itemLabel: string) {
    const shouldDelete = window.confirm(
      `Delete "${itemLabel}" from memory? This cannot be undone.`
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingId(id);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/memory/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete memory");
      }

      setItems((current) => current.filter((item) => item.id !== id));
    } catch {
      setErrorMessage("Couldn't delete that memory item.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Memory</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Save explicit context that Nomi can carry into future conversations.
      </p>

      <section className="mt-6 rounded-3xl border border-border/80 bg-card/60 p-5 shadow-sm">
        <div className="border-b border-border/70 pb-4">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Create item
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Add memory
          </h2>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Label</span>
            <input
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="Favorite tone"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              disabled={isSubmitting}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Value</span>
            <textarea
              className="min-h-28 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="Prefer concise answers with direct recommendations."
              value={value}
              onChange={(event) => setValue(event.target.value)}
              disabled={isSubmitting}
            />
          </label>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save memory"}
          </Button>
        </form>
      </section>

      <section className="mt-6 rounded-3xl border border-border/80 bg-card/60 p-5 shadow-sm">
        <div className="border-b border-border/70 pb-4">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Current items
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Active memory
          </h2>
        </div>

        {errorMessage ? (
          <p
            className="mt-4 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            role="status"
            aria-live="polite"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-4 space-y-3">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
              No memory saved yet.
            </div>
          ) : (
            items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-border/80 bg-background/80 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold">{item.label}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {item.value}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item.id, item.label)}
                  >
                    {deletingId === item.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
