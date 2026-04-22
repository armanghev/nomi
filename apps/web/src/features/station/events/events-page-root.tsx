"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EventCard } from "@/components/ops/event-card";
import { Input } from "@/components/ui/input";
import { getMockDomainActions } from "@/features/mock-domain/actions";
import { useMockDomainStore } from "@/features/mock-domain/store";
import type { DomainEvent, MockDomainState } from "@/features/mock-domain/types";

function includesInsensitive(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

function matchesModel(event: DomainEvent, model: string, state: MockDomainState) {
  if (model === "all") {
    return true;
  }

  const runsByEntity = state.modelRuns.filter(
    (run) => run.agentId === event.entityId || run.conversationId === event.entityId
  );

  return runsByEntity.some((run) => run.model === model);
}

function matchesConversation(
  event: DomainEvent,
  conversationId: string,
  state: MockDomainState
) {
  if (conversationId === "all") {
    return true;
  }

  if (event.entityId === conversationId) {
    return true;
  }

  return state.modelRuns.some(
    (run) => run.conversationId === conversationId && run.agentId === event.entityId
  );
}

export function EventsPageRoot() {
  const state = useMockDomainStore((snapshot) => snapshot);
  const actions = useMemo(() => getMockDomainActions(), []);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [tokenFilter, setTokenFilter] = useState<string>("all");
  const [conversationFilter, setConversationFilter] = useState<string>("all");
  const [modelFilter, setModelFilter] = useState<string>("all");

  const selectedId =
    state.inspectorSelection?.kind === "event" ? state.inspectorSelection.id : null;

  const filteredEvents = useMemo(() => {
    return state.events.filter((event) => {
      const matchesSearch =
        search.trim().length === 0 ||
        includesInsensitive(event.message, search) ||
        includesInsensitive(event.type, search);
      const typeMatches = typeFilter === "all" || event.type === typeFilter;
      const severityMatches =
        severityFilter === "all" || event.severity === severityFilter;
      const tokenMatches =
        tokenFilter === "all" ||
        (tokenFilter === event.entityId &&
          state.tokens.some((token) => token.id === event.entityId));

      return (
        matchesSearch &&
        typeMatches &&
        severityMatches &&
        tokenMatches &&
        matchesConversation(event, conversationFilter, state) &&
        matchesModel(event, modelFilter, state)
      );
    });
  }, [
    conversationFilter,
    modelFilter,
    search,
    severityFilter,
    state,
    tokenFilter,
    typeFilter,
  ]);

  const groupedEvents = filteredEvents.reduce<Record<string, DomainEvent[]>>(
    (acc, event) => {
      const key = event.type;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(event);
      return acc;
    },
    {}
  );

  const eventTypes = [...new Set(state.events.map((event) => event.type))];
  const models = [...new Set(state.modelRuns.map((run) => run.model))];

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Station</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Canonical operational timeline grouped by event type with incident actions.
        </p>
      </header>

      <article className="grid gap-2 rounded-xl border border-border/75 bg-background/80 p-3 md:grid-cols-6">
        <Input
          aria-label="Search events"
          placeholder="Search events"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="md:col-span-2"
        />

        <select
          className="h-9 rounded-lg border border-border/70 bg-background px-2 text-sm"
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          aria-label="Filter by type"
        >
          <option value="all">All types</option>
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          className="h-9 rounded-lg border border-border/70 bg-background px-2 text-sm"
          value={severityFilter}
          onChange={(event) => setSeverityFilter(event.target.value)}
          aria-label="Filter by severity"
        >
          <option value="all">All severities</option>
          <option value="info">info</option>
          <option value="warning">warning</option>
          <option value="critical">critical</option>
        </select>

        <select
          className="h-9 rounded-lg border border-border/70 bg-background px-2 text-sm"
          value={tokenFilter}
          onChange={(event) => setTokenFilter(event.target.value)}
          aria-label="Filter by token"
        >
          <option value="all">All tokens</option>
          {state.tokens.map((token) => (
            <option key={token.id} value={token.id}>
              {token.label}
            </option>
          ))}
        </select>

        <select
          className="h-9 rounded-lg border border-border/70 bg-background px-2 text-sm"
          value={conversationFilter}
          onChange={(event) => setConversationFilter(event.target.value)}
          aria-label="Filter by conversation"
        >
          <option value="all">All conversations</option>
          {state.conversations.map((conversation) => (
            <option key={conversation.id} value={conversation.id}>
              {conversation.title}
            </option>
          ))}
        </select>

        <select
          className="h-9 rounded-lg border border-border/70 bg-background px-2 text-sm md:col-span-2"
          value={modelFilter}
          onChange={(event) => setModelFilter(event.target.value)}
          aria-label="Filter by model"
        >
          <option value="all">All models</option>
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </article>

      <div className="space-y-4">
        {Object.entries(groupedEvents).map(([type, events]) => (
          <section key={type} className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {type}
            </h2>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                selected={selectedId === event.id}
                onClick={() => actions.selectInspector({ kind: "event", id: event.id })}
                linkSlot={
                  <div className="flex gap-2">
                    <Link href="/station/events" className="underline-offset-2 hover:underline">
                      View event
                    </Link>
                    <span>·</span>
                    <Link href="/chat" className="underline-offset-2 hover:underline">
                      Open related chat
                    </Link>
                  </div>
                }
              />
            ))}
          </section>
        ))}

        {filteredEvents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
            No timeline events match current filters.
          </p>
        ) : null}
      </div>
    </section>
  );
}
