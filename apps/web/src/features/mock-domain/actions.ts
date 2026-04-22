import { nanoid } from "nanoid";
import { getMockDomainStore } from "./store";
import type { MockDomainStore } from "./store";
import type {
  DomainEvent,
  EventSeverity,
  EventStatus,
  EventType,
  InspectorSelection,
  MemoryUpdate,
} from "./types";

function nowIso() {
  return new Date().toISOString();
}

function createEvent(
  type: EventType,
  entityId: string,
  message: string,
  severity: EventSeverity
): DomainEvent {
  return {
    id: `event-${nanoid(10)}`,
    type,
    severity,
    status: "pending",
    message,
    entityId,
    createdAt: nowIso(),
    acknowledged: false,
    resolved: false,
  };
}

function setEventStatus(
  store: MockDomainStore,
  eventId: string,
  status: EventStatus
) {
  store.setState((current) => ({
    ...current,
    events: current.events.map((event) =>
      event.id === eventId ? { ...event, status } : event
    ),
  }));
}

function emitEvent(store: MockDomainStore, event: DomainEvent) {
  store.setState((current) => ({
    ...current,
    events: [event, ...current.events],
  }));
}

export function createMockDomainActions(store: MockDomainStore) {
  return {
    selectInspector(selection: InspectorSelection | null) {
      store.setState((current) => ({
        ...current,
        inspectorSelection: selection,
      }));
    },

    pauseToken(tokenId: string) {
      const event = createEvent(
        "token.pause",
        tokenId,
        "Token pause requested by operator.",
        "info"
      );
      emitEvent(store, event);

      store.setState((current) => ({
        ...current,
        tokens: current.tokens.map((token) =>
          token.id === tokenId ? { ...token, status: "paused" } : token
        ),
      }));

      setEventStatus(store, event.id, "success");
      return event.id;
    },

    resumeToken(tokenId: string) {
      const event = createEvent(
        "token.resume",
        tokenId,
        "Token resume requested by operator.",
        "info"
      );
      emitEvent(store, event);

      store.setState((current) => ({
        ...current,
        tokens: current.tokens.map((token) =>
          token.id === tokenId ? { ...token, status: "active" } : token
        ),
      }));

      setEventStatus(store, event.id, "success");
      return event.id;
    },

    editMemory(memoryId: string, patch: MemoryUpdate) {
      const event = createEvent(
        "memory.update",
        memoryId,
        "Memory entry updated.",
        "info"
      );
      emitEvent(store, event);

      store.setState((current) => ({
        ...current,
        memories: current.memories.map((memory) =>
          memory.id === memoryId
            ? {
                ...memory,
                ...patch,
                updatedAt: nowIso(),
              }
            : memory
        ),
      }));

      setEventStatus(store, event.id, "success");
      return event.id;
    },

    deleteMemory(memoryId: string) {
      const event = createEvent(
        "memory.delete",
        memoryId,
        "Memory entry deleted.",
        "warning"
      );
      emitEvent(store, event);

      store.setState((current) => ({
        ...current,
        memories: current.memories.filter((memory) => memory.id !== memoryId),
      }));

      setEventStatus(store, event.id, "success");
      return event.id;
    },

    ackEvent(eventId: string) {
      const event = createEvent(
        "event.ack",
        eventId,
        "Event acknowledged by operator.",
        "info"
      );
      emitEvent(store, event);

      store.setState((current) => ({
        ...current,
        events: current.events.map((item) =>
          item.id === eventId ? { ...item, acknowledged: true } : item
        ),
      }));

      setEventStatus(store, event.id, "success");
      return event.id;
    },

    resolveEvent(eventId: string) {
      const event = createEvent(
        "event.resolve",
        eventId,
        "Event resolved by operator.",
        "info"
      );
      emitEvent(store, event);

      store.setState((current) => ({
        ...current,
        events: current.events.map((item) =>
          item.id === eventId
            ? { ...item, resolved: true, acknowledged: true }
            : item
        ),
      }));

      setEventStatus(store, event.id, "success");
      return event.id;
    },

    retryRun(agentId: string) {
      const event = createEvent(
        "agent.retry",
        agentId,
        "Agent run retry requested.",
        "warning"
      );
      emitEvent(store, event);
      setEventStatus(store, event.id, "retrying");
      setEventStatus(store, event.id, "success");
      return event.id;
    },

    rerunPrompt(conversationId: string) {
      const event = createEvent(
        "chat.rerun",
        conversationId,
        "Prompt re-run requested with same context.",
        "info"
      );
      emitEvent(store, event);
      setEventStatus(store, event.id, "success");
      return event.id;
    },

    pinSource(sourceId: string) {
      const event = createEvent(
        "source.pin",
        sourceId,
        "Source pinned to conversation.",
        "info"
      );
      emitEvent(store, event);

      store.setState((current) => ({
        ...current,
        sources: current.sources.map((source) =>
          source.id === sourceId ? { ...source, pinned: true } : source
        ),
      }));

      setEventStatus(store, event.id, "success");
      return event.id;
    },

    unpinSource(sourceId: string) {
      const event = createEvent(
        "source.unpin",
        sourceId,
        "Source unpinned from conversation.",
        "info"
      );
      emitEvent(store, event);

      store.setState((current) => ({
        ...current,
        sources: current.sources.map((source) =>
          source.id === sourceId ? { ...source, pinned: false } : source
        ),
      }));

      setEventStatus(store, event.id, "success");
      return event.id;
    },
  };
}

let singletonActions: ReturnType<typeof createMockDomainActions> | null = null;

export function getMockDomainActions() {
  if (!singletonActions) {
    singletonActions = createMockDomainActions(getMockDomainStore());
  }

  return singletonActions;
}
