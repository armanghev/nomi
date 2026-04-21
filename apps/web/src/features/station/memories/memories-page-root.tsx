"use client";

import { useMockDomainStore } from "@/features/mock-domain/store";

export function MemoriesPageRoot() {
  const memories = useMockDomainStore((state) => state.memories);

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Station</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Memories</h1>
      </header>

      <div className="space-y-2">
        {memories.map((memory) => (
          <article
            key={memory.id}
            className="rounded-xl border border-border/75 bg-background/80 px-4 py-3"
          >
            <p className="text-sm font-medium">{memory.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{memory.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
