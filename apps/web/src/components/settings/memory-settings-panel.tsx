"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookTextIcon, LoaderCircleIcon } from "lucide-react";

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
    <main className="space-y-5">
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Settings
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Memory</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Save explicit context that Nomi can carry into future conversations.
          Keep entries short and specific.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border/75 bg-background/72 p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium">
            <BookTextIcon className="size-4 text-muted-foreground" />
            Add memory item
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm">Label</span>
              <Input
                placeholder="Preferred response style"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                disabled={isSubmitting}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm">Value</span>
              <Textarea
                className="min-h-28"
                placeholder="Prefer concise answers with direct recommendations."
                value={value}
                onChange={(event) => setValue(event.target.value)}
                disabled={isSubmitting}
              />
            </label>

            <Button
              type="submit"
              disabled={isSubmitting || !label.trim() || !value.trim()}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircleIcon className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save memory"
              )}
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-border/75 bg-background/72 p-4">
          <div className="mb-4 text-sm font-medium">Active memory</div>

          {errorMessage ? (
            <p
              className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="status"
              aria-live="polite"
            >
              {errorMessage}
            </p>
          ) : null}

          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
                No memory saved yet.
              </div>
            ) : (
              items.map((item) => (
                <article
                  key={item.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-border/70 bg-background/80 px-3 py-3"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-medium">{item.label}</h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
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
                    {deletingId === item.id ? (
                      <>
                        <LoaderCircleIcon className="size-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
