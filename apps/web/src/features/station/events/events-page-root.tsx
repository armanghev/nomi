"use client";

import { useMockDomainStore } from "@/features/mock-domain/store";

export function EventsPageRoot() {
  const events = useMockDomainStore((state) => state.events);

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Station</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Events</h1>
      </header>

      <div className="space-y-2">
        {events.map((event) => (
          <article
            key={event.id}
            className="rounded-xl border border-border/75 bg-background/80 px-4 py-3"
          >
            <p className="text-sm font-medium">{event.message}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {event.type} · {event.status} · {event.severity}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
