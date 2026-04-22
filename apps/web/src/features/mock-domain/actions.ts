import { nanoid } from "nanoid";
import { getMockDomainStore } from "./store";
import type { MockDomainStore } from "./store";
import type {
  ConnectionStatus,
  ConversationMessage,
  DomainEvent,
  EventSeverity,
  EventStatus,
  EventType,
  InspectorSelection,
  MemoryUpdate,
  TokenCreateInput,
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

function emitLifecycleEvent(args: {
  store: MockDomainStore;
  type: EventType;
  entityId: string;
  message: string;
  severity: EventSeverity;
  status: EventStatus;
  mutate: () => void;
}) {
  const event = createEvent(args.type, args.entityId, args.message, args.severity);
  emitEvent(args.store, event);
  args.mutate();
  setEventStatus(args.store, event.id, args.status);
  return event.id;
}

function withUpdatedConversations(store: MockDomainStore) {
  const timestamp = nowIso();

  store.setState((current) => ({
    ...current,
    conversations: current.conversations.map((conversation) => ({
      ...conversation,
      updatedAt: timestamp,
    })),
  }));
}

function createAssistantReply(content: string) {
  if (content.toLowerCase().includes("status")) {
    return "Current status: connections are healthy overall, one degraded provider requires review.";
  }

  if (content.toLowerCase().includes("token")) {
    return "Token operations updated. Check Station > Tokens and Events for audit trail.";
  }

  return "Acknowledged. I linked this context back to Station so you can inspect related events.";
}

export function createMockDomainActions(store: MockDomainStore) {
  return {
    selectInspector(selection: InspectorSelection | null) {
      store.setState((current) => ({
        ...current,
        inspectorSelection: selection,
      }));
    },

    createToken(input: TokenCreateInput) {
      const tokenId = `token-${nanoid(8)}`;
      const anomalyTags = [
        input.dailyCostUsd > 1 ? "high_cost" : null,
        input.dailyCostUsd < 0.1 ? "low_usage" : null,
      ].filter(Boolean) as string[];

      const event = createEvent(
        "token.create",
        tokenId,
        "Token created by operator.",
        "info"
      );
      emitEvent(store, event);

      store.setState((current) => ({
        ...current,
        tokens: [
          {
            id: tokenId,
            label: input.label,
            status: "active",
            lastUsedAt: null,
            dailyCostUsd: input.dailyCostUsd,
            anomalyTags,
          },
          ...current.tokens,
        ],
      }));

      setEventStatus(store, event.id, "success");
      return tokenId;
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

    revokeToken(tokenId: string) {
      const event = createEvent(
        "token.revoke",
        tokenId,
        "Token revoked by operator.",
        "critical"
      );
      emitEvent(store, event);

      store.setState((current) => ({
        ...current,
        tokens: current.tokens.map((token) =>
          token.id === tokenId ? { ...token, status: "revoked" } : token
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
      withUpdatedConversations(store);

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
      withUpdatedConversations(store);

      setEventStatus(store, event.id, "success");
      return event.id;
    },

    reconnectConnection(
      connectionId: string,
      options: {
        shouldFail?: boolean;
      } = {}
    ) {
      const snapshot = store.getState();
      const connection = snapshot.connections.find((item) => item.id === connectionId);

      if (!connection) {
        return null;
      }

      const previousStatus = connection.status;

      emitLifecycleEvent({
        store,
        type: "connection.connect",
        entityId: connectionId,
        message: "Connection queued.",
        severity: "info",
        status: "success",
        mutate: () => {
          store.setState((current) => ({
            ...current,
            connections: current.connections.map((item) =>
              item.id === connectionId ? { ...item, status: "connecting" } : item
            ),
          }));
        },
      });

      emitLifecycleEvent({
        store,
        type: "connection.connect",
        entityId: connectionId,
        message: "Connection consent review.",
        severity: "info",
        status: "success",
        mutate: () => {
          store.setState((current) => ({
            ...current,
            connections: current.connections.map((item) =>
              item.id === connectionId ? { ...item, status: "consent_review" } : item
            ),
          }));
        },
      });

      emitLifecycleEvent({
        store,
        type: "connection.connect",
        entityId: connectionId,
        message: "Connection callback pending.",
        severity: "info",
        status: "success",
        mutate: () => {
          store.setState((current) => ({
            ...current,
            connections: current.connections.map((item) =>
              item.id === connectionId ? { ...item, status: "callback_pending" } : item
            ),
          }));
        },
      });

      if (options.shouldFail) {
        const failedEvent = createEvent(
          "connection.connect",
          connectionId,
          "Connection failed and rolled back.",
          "warning"
        );
        emitEvent(store, failedEvent);

        store.setState((current) => ({
          ...current,
          connections: current.connections.map((item) =>
            item.id === connectionId ? { ...item, status: previousStatus } : item
          ),
        }));

        setEventStatus(store, failedEvent.id, "failed");
        return failedEvent.id;
      }

      const successEvent = createEvent(
        "connection.connect",
        connectionId,
        "Connection established.",
        "info"
      );
      emitEvent(store, successEvent);

      store.setState((current) => ({
        ...current,
        connections: current.connections.map((item) =>
          item.id === connectionId
            ? {
                ...item,
                status: "connected",
                lastSyncAt: nowIso(),
                healthScore: Math.min(100, item.healthScore + 20),
              }
            : item
        ),
      }));

      setEventStatus(store, successEvent.id, "success");
      return successEvent.id;
    },

    disconnectConnection(connectionId: string) {
      const currentConnection = store
        .getState()
        .connections.find((item) => item.id === connectionId);

      if (!currentConnection) {
        return null;
      }

      emitLifecycleEvent({
        store,
        type: "connection.disconnect",
        entityId: connectionId,
        message: "Disconnect requested.",
        severity: "warning",
        status: "success",
        mutate: () => {
          store.setState((current) => ({
            ...current,
            connections: current.connections.map((item) =>
              item.id === connectionId ? { ...item, status: "disconnecting" } : item
            ),
          }));
        },
      });

      const event = createEvent(
        "connection.disconnect",
        connectionId,
        "Connection disconnected.",
        "warning"
      );
      emitEvent(store, event);

      store.setState((current) => ({
        ...current,
        connections: current.connections.map((item) =>
          item.id === connectionId
            ? {
                ...item,
                status: "disconnected",
                lastSyncAt: null,
                healthScore: Math.max(0, item.healthScore - 20),
              }
            : item
        ),
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

    retryRun(
      agentId: string,
      options: {
        shouldFail?: boolean;
      } = {}
    ) {
      const queuedEvent = createEvent(
        "agent.retry",
        agentId,
        "Retry queued.",
        "warning"
      );
      emitEvent(store, queuedEvent);

      store.setState((current) => ({
        ...current,
        agents: current.agents.map((agent) =>
          agent.id === agentId
            ? {
                ...agent,
                status: "running",
                activeRuns: agent.activeRuns + 1,
              }
            : agent
        ),
      }));
      setEventStatus(store, queuedEvent.id, "success");

      const runningEvent = createEvent(
        "agent.retry",
        agentId,
        "Retry running.",
        "info"
      );
      emitEvent(store, runningEvent);
      setEventStatus(store, runningEvent.id, "retrying");

      const didFail = options.shouldFail === true;
      const finalEvent = createEvent(
        "agent.retry",
        agentId,
        didFail ? "Retry failed." : "Retry completed successfully.",
        didFail ? "critical" : "info"
      );
      emitEvent(store, finalEvent);

      store.setState((current) => {
        const conversationId = current.conversations[0]?.id;

        return {
          ...current,
          agents: current.agents.map((agent) =>
            agent.id === agentId
              ? {
                  ...agent,
                  status: didFail ? "degraded" : "healthy",
                  lastRunAt: nowIso(),
                  lastRunStatus: didFail ? "failed" : "success",
                }
              : agent
          ),
          modelRuns: [
            {
              id: `run-${nanoid(8)}`,
              agentId,
              conversationId: conversationId ?? "conversation-unknown",
              model: "gpt-5.4",
              latencyMs: didFail ? 2110 : 840,
              costUsd: didFail ? 0.051 : 0.032,
              status: didFail ? "failed" : "success",
              createdAt: nowIso(),
            },
            ...current.modelRuns,
          ],
        };
      });

      setEventStatus(store, finalEvent.id, didFail ? "failed" : "success");
      return finalEvent.id;
    },

    rerunPrompt(conversationId: string) {
      const event = createEvent(
        "chat.rerun",
        conversationId,
        "Prompt re-run requested with same context.",
        "info"
      );
      emitEvent(store, event);

      store.setState((current) => ({
        ...current,
        conversations: current.conversations.map((conversation) => {
          if (conversation.id !== conversationId) {
            return conversation;
          }

          const message: ConversationMessage = {
            id: `message-${nanoid(8)}`,
            role: "assistant",
            content: "Re-run complete. Context replayed and outputs refreshed.",
            createdAt: nowIso(),
          };

          return {
            ...conversation,
            updatedAt: nowIso(),
            messages: [...conversation.messages, message],
          };
        }),
      }));

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
        conversations: current.conversations.map((conversation) => ({
          ...conversation,
          sourceIds: conversation.sourceIds.includes(sourceId)
            ? conversation.sourceIds
            : [...conversation.sourceIds, sourceId],
        })),
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

    sendConversationMessage(conversationId: string | null, content: string) {
      const timestamp = nowIso();
      const userMessage: ConversationMessage = {
        id: `message-${nanoid(8)}`,
        role: "user",
        content,
        createdAt: timestamp,
      };
      const assistantMessage: ConversationMessage = {
        id: `message-${nanoid(8)}`,
        role: "assistant",
        content: createAssistantReply(content),
        createdAt: nowIso(),
      };

      const nextConversationId = conversationId ?? `conv-${nanoid(8)}`;

      store.setState((current) => {
        const exists = current.conversations.some(
          (conversation) => conversation.id === nextConversationId
        );

        if (!exists) {
          return {
            ...current,
            conversations: [
              {
                id: nextConversationId,
                title: content.slice(0, 48),
                sourceIds: [],
                updatedAt: timestamp,
                messages: [userMessage, assistantMessage],
              },
              ...current.conversations,
            ],
          };
        }

        return {
          ...current,
          conversations: current.conversations.map((conversation) =>
            conversation.id === nextConversationId
              ? {
                  ...conversation,
                  title:
                    conversation.title.trim().length > 0
                      ? conversation.title
                      : content.slice(0, 48),
                  updatedAt: timestamp,
                  messages: [...conversation.messages, userMessage, assistantMessage],
                }
              : conversation
          ),
        };
      });

      return nextConversationId;
    },

    setConnectionStatus(connectionId: string, status: ConnectionStatus) {
      store.setState((current) => ({
        ...current,
        connections: current.connections.map((connection) =>
          connection.id === connectionId ? { ...connection, status } : connection
        ),
      }));
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
