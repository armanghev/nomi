import { nanoid } from "nanoid";
import { getMockDomainStore } from "./store";
import type { MockDomainStore } from "./store";
import type {
  Connection,
  ConnectionStatus,
  ConversationAttachment,
  ConversationMessage,
  DomainEvent,
  EventSeverity,
  EventStatus,
  EventType,
  InspectorSelection,
  MemoryUpdate,
  ToolCall,
  ToolCallStatus,
  TokenCreateInput,
} from "./types";

const ASSISTANT_STREAM_INTERVAL_MS = 28;
const TOOL_PREFACE_DELAY_MS = 80;
const TOOL_FIRST_START_DELAY_MS = 900;
const TOOL_START_STAGGER_MS = 760;
const TOOL_FINAL_RESPONSE_DELAY_MS = 220;
const conversationExecutionVersions = new Map<string, number>();

function nowIso() {
  return new Date().toISOString();
}

function bumpConversationExecutionVersion(conversationId: string) {
  const nextVersion = (conversationExecutionVersions.get(conversationId) ?? 0) + 1;
  conversationExecutionVersions.set(conversationId, nextVersion);
  return nextVersion;
}

function isConversationExecutionCurrent(
  conversationId: string,
  expectedVersion: number
) {
  return conversationExecutionVersions.get(conversationId) === expectedVersion;
}

function bytesToUuid(bytes: Uint8Array) {
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join(
    ""
  );

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20
  )}-${hex.slice(20)}`;
}

function createUuid() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);

  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return bytesToUuid(bytes);
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

function normalize(value: string) {
  return value.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
}

function includesAlias(haystack: string, alias: string) {
  const normalizedAlias = normalize(alias);
  if (!normalizedAlias) {
    return false;
  }

  return haystack.includes(normalizedAlias);
}

function resolveMentionedConnections(content: string, connections: Connection[]) {
  const normalizedContent = normalize(content);

  return connections.filter((connection) => {
    const aliases = [
      connection.appName,
      connection.provider,
      connection.provider.replaceAll("_", " "),
    ];

    return aliases.some((alias) => includesAlias(normalizedContent, alias));
  });
}

function selectToolForConnection(connection: Connection) {
  const defaults: Partial<Record<Connection["provider"], string>> = {
    github: "get_pr",
    vercel: "get_deployment_logs",
    gmail: "search_threads",
    google_calendar: "list_events",
    google_drive: "search_files",
    notion: "search",
    linear: "search_issues",
  };

  const preferred = defaults[connection.provider];
  if (preferred && connection.availableTools.includes(preferred)) {
    return preferred;
  }

  return connection.availableTools[0] ?? "run_tool";
}

type ToolExecutionPlan = {
  messageId: string;
  startedAt: string;
  startDelayMs: number;
  finishDelayMs: number;
  finalDurationMs: number;
  finalStatus: ToolCallStatus;
  toolCall: ToolCall;
};

function resolveFinalToolStatus(connection: Connection, index: number): ToolCallStatus {
  if (connection.status === "disconnected" || connection.status === "failed") {
    return "failed";
  }

  if (connection.status === "degraded") {
    return index % 2 === 0 ? "failed" : "success";
  }

  if (connection.healthScore < 60) {
    return "failed";
  }

  return index % 5 === 0 && connection.healthScore < 80 ? "failed" : "success";
}

function buildToolExecutionPlan(args: {
  connections: Connection[];
  initialTimestamp: string;
}) {
  return args.connections.map((connection, index): ToolExecutionPlan => {
    const startDelayMs = TOOL_FIRST_START_DELAY_MS + index * TOOL_START_STAGGER_MS;
    const finalStatus = resolveFinalToolStatus(connection, index);
    const finalDurationMs =
      620 +
      index * 190 +
      (100 - connection.healthScore) * 4 +
      (finalStatus === "failed" ? 260 : 0);
    const finishDelayMs = startDelayMs + finalDurationMs;
    const startedAt = args.initialTimestamp;

    return {
      messageId: `message-${nanoid(8)}`,
      startedAt,
      startDelayMs,
      finishDelayMs,
      finalDurationMs,
      finalStatus,
      toolCall: {
        id: `tool-call-${nanoid(8)}`,
        connectionId: connection.id,
        provider: connection.provider,
        appName: connection.appName,
        accountEmail: connection.accountEmail,
        toolName: selectToolForConnection(connection),
        status: "running",
        startedAt,
        durationMs: null,
      },
    };
  });
}

function createDefaultAssistantReply(content: string) {
  if (content.toLowerCase().includes("status")) {
    return "Current status: connections are healthy overall, one degraded provider requires review.";
  }

  if (content.toLowerCase().includes("token")) {
    return "Token operations updated. Check Station > Tokens and Events for audit trail.";
  }

  return "Acknowledged. I linked this context back to Station so you can inspect related events.";
}

function createToolPreface(toolPlans: ToolExecutionPlan[]) {
  const appNames = toolPlans.map((plan) => plan.toolCall.appName);

  if (appNames.length === 1) {
    return `On it — I’ll call ${appNames[0]} now and report back in a second.`;
  }

  if (appNames.length === 2) {
    return `On it — I’ll call ${appNames[0]} and ${appNames[1]} now, then summarize what I find.`;
  }

  const head = appNames.slice(0, -1).join(", ");
  const tail = appNames[appNames.length - 1];
  return `On it — I’ll call ${head}, and ${tail}, then summarize the results.`;
}

function describeToolOutcome(toolCall: ToolCall) {
  if (toolCall.status === "failed") {
    const failedByProvider: Record<ToolCall["provider"], string> = {
      github: "GitHub request failed due to an expired OAuth token.",
      vercel: "Vercel logs request timed out for the selected deployment.",
      gmail: "Gmail search failed because mailbox access was denied.",
      google_calendar: "Google Calendar request failed because event scope is missing.",
      google_drive: "Google Drive search failed due to permission mismatch.",
      notion: "Notion search failed because the integration is disconnected.",
      linear: "Linear issue query failed with an API auth error.",
    };

    return `${toolCall.appName}: ${failedByProvider[toolCall.provider]}`;
  }

  const successByProvider: Record<ToolCall["provider"], string> = {
    github: "GitHub: Found open PR #148 \"tool-call-inline\" with 2 pending checks.",
    vercel: "Vercel: Latest deployment is ready; logs show zero runtime errors in the last hour.",
    gmail: "Gmail: Found 3 relevant threads, including one unread message from your instructor.",
    google_calendar: "Google Calendar: Next event is \"Algorithms Office Hours\" at 2:00 PM.",
    google_drive: "Google Drive: Found 4 matching docs; newest is \"Nomi Integration Notes\".",
    notion: "Notion: Found the \"Nomi Operator Backlog\" page and 2 linked tasks.",
    linear: "Linear: Found 5 matching issues; highest priority is NOMI-42.",
  };

  return successByProvider[toolCall.provider];
}

function createToolSummaryResponse(completedToolCalls: ToolCall[]) {
  const successCount = completedToolCalls.filter(
    (toolCall) => toolCall.status === "success"
  ).length;
  const failureCount = completedToolCalls.length - successCount;

  const summaryHeader =
    failureCount === 0
      ? `Done. ${successCount} tool call${successCount === 1 ? "" : "s"} succeeded.`
      : `Tool execution finished with ${successCount} success and ${failureCount} failure${failureCount === 1 ? "" : "s"}.`;

  const details = completedToolCalls.map((toolCall) => `- ${describeToolOutcome(toolCall)}`);

  return [summaryHeader, ...details].join("\n");
}

function appendMessageToConversation(
  store: MockDomainStore,
  conversationId: string,
  message: ConversationMessage
) {
  store.setState((current) => ({
    ...current,
    conversations: current.conversations.map((conversation) =>
      conversation.id === conversationId
        ? {
            ...conversation,
            updatedAt: nowIso(),
            messages: [...conversation.messages, message],
          }
        : conversation
    ),
  }));
}

function updateConversationMessageContent(args: {
  store: MockDomainStore;
  conversationId: string;
  messageId: string;
  content: string;
}) {
  args.store.setState((current) => ({
    ...current,
    conversations: current.conversations.map((conversation) =>
      conversation.id === args.conversationId
        ? {
            ...conversation,
            updatedAt: nowIso(),
            messages: conversation.messages.map((message) =>
              message.id === args.messageId
                ? {
                    ...message,
                    content: args.content,
                  }
                : message
            ),
          }
        : conversation
    ),
  }));
}

function streamAssistantMessage(args: {
  store: MockDomainStore;
  conversationId: string;
  content: string;
  executionVersion: number;
  startDelayMs?: number;
  streamIntervalMs?: number;
}) {
  const messageId = `message-${nanoid(8)}`;
  const tokens = args.content.split(/(\s+)/).filter((token) => token.length > 0);
  const startDelayMs = args.startDelayMs ?? 0;
  const streamIntervalMs = args.streamIntervalMs ?? ASSISTANT_STREAM_INTERVAL_MS;

  setTimeout(() => {
    if (
      !isConversationExecutionCurrent(args.conversationId, args.executionVersion)
    ) {
      return;
    }

    appendMessageToConversation(args.store, args.conversationId, {
      id: messageId,
      role: "assistant",
      content: "",
      createdAt: nowIso(),
    });

    let nextContent = "";
    tokens.forEach((token, index) => {
      setTimeout(() => {
        if (
          !isConversationExecutionCurrent(args.conversationId, args.executionVersion)
        ) {
          return;
        }

        nextContent += token;
        updateConversationMessageContent({
          store: args.store,
          conversationId: args.conversationId,
          messageId,
          content: nextContent,
        });
      }, index * streamIntervalMs);
    });
  }, startDelayMs);
}

function finalizeToolMessage(args: {
  store: MockDomainStore;
  conversationId: string;
  messageId: string;
  finalizedToolCall: ToolCall;
}) {
  args.store.setState((current) => ({
    ...current,
    toolCalls: [args.finalizedToolCall, ...current.toolCalls],
    connections: current.connections.map((connection) => {
      if (connection.id !== args.finalizedToolCall.connectionId) {
        return connection;
      }

      if (args.finalizedToolCall.status === "success") {
        return {
          ...connection,
          status: "connected",
          lastSyncAt: nowIso(),
          healthScore: Math.min(100, connection.healthScore + 3),
        };
      }

      return {
        ...connection,
        status:
          connection.status === "disconnected" ? connection.status : "degraded",
        healthScore: Math.max(0, connection.healthScore - 5),
      };
    }),
    conversations: current.conversations.map((conversation) => {
      if (conversation.id !== args.conversationId) {
        return conversation;
      }

      return {
        ...conversation,
        updatedAt: nowIso(),
        messages: conversation.messages.map((message) =>
          message.id === args.messageId
            ? {
                ...message,
                toolCall: args.finalizedToolCall,
              }
            : message
        ),
      };
    }),
  }));
}

function simulateToolExecution(args: {
  store: MockDomainStore;
  conversationId: string;
  executionVersion: number;
  plan: ToolExecutionPlan[];
}) {
  args.plan.forEach((execution) => {
    setTimeout(() => {
      if (
        !isConversationExecutionCurrent(args.conversationId, args.executionVersion)
      ) {
        return;
      }

      appendMessageToConversation(args.store, args.conversationId, {
        id: execution.messageId,
        role: "tool",
        content: "",
        createdAt: nowIso(),
        toolCall: execution.toolCall,
      });
    }, execution.startDelayMs);

    setTimeout(() => {
      if (
        !isConversationExecutionCurrent(args.conversationId, args.executionVersion)
      ) {
        return;
      }

      const finalizedToolCall: ToolCall = {
        ...execution.toolCall,
        status: execution.finalStatus,
        durationMs: execution.finalDurationMs,
      };

      finalizeToolMessage({
        store: args.store,
        conversationId: args.conversationId,
        messageId: execution.messageId,
        finalizedToolCall,
      });
    }, execution.finishDelayMs);
  });

  const lastFinishDelay = args.plan.reduce(
    (maxDelay, execution) => Math.max(maxDelay, execution.finishDelayMs),
    0
  );

  setTimeout(() => {
    if (!isConversationExecutionCurrent(args.conversationId, args.executionVersion)) {
      return;
    }

    const completedToolCalls = args.plan.map((execution) => ({
      ...execution.toolCall,
      status: execution.finalStatus,
      durationMs: execution.finalDurationMs,
    }));
    streamAssistantMessage({
      store: args.store,
      conversationId: args.conversationId,
      content: createToolSummaryResponse(completedToolCalls),
      executionVersion: args.executionVersion,
      startDelayMs: TOOL_FINAL_RESPONSE_DELAY_MS,
    });
  }, lastFinishDelay);
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

    sendConversationMessage(
      conversationId: string | null,
      content: string,
      attachments: ConversationAttachment[] = []
    ) {
      const timestamp = nowIso();
      const normalizedContent = content.trim();
      const nextTitle = normalizedContent
        ? normalizedContent.slice(0, 48)
        : attachments[0]?.name ?? "New conversation";
      const currentState = store.getState();
      const matchedConnections = resolveMentionedConnections(
        normalizedContent,
        currentState.connections
      );
      const executionPlan = buildToolExecutionPlan({
        connections: matchedConnections,
        initialTimestamp: timestamp,
      });
      const userMessage: ConversationMessage = {
        id: `message-${nanoid(8)}`,
        role: "user",
        content: normalizedContent,
        createdAt: timestamp,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      const nextConversationId = conversationId ?? createUuid();
      const executionVersion = bumpConversationExecutionVersion(nextConversationId);

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
                title: nextTitle,
                sourceIds: [],
                updatedAt: timestamp,
                messages: [userMessage],
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
                      : nextTitle,
                  updatedAt: timestamp,
                  messages: [...conversation.messages, userMessage],
                }
              : conversation
          ),
        };
      });

      if (executionPlan.length > 0) {
        streamAssistantMessage({
          store,
          conversationId: nextConversationId,
          content: createToolPreface(executionPlan),
          executionVersion,
          startDelayMs: TOOL_PREFACE_DELAY_MS,
        });

        simulateToolExecution({
          store,
          conversationId: nextConversationId,
          executionVersion,
          plan: executionPlan,
        });
      } else {
        streamAssistantMessage({
          store,
          conversationId: nextConversationId,
          content: createDefaultAssistantReply(normalizedContent),
          executionVersion,
          startDelayMs: TOOL_PREFACE_DELAY_MS,
        });
      }

      return nextConversationId;
    },

    editConversationMessage(
      conversationId: string,
      messageId: string,
      content: string,
      attachments?: ConversationAttachment[]
    ) {
      const currentState = store.getState();
      const conversation = currentState.conversations.find(
        (item) => item.id === conversationId
      );

      if (!conversation) {
        return null;
      }

      const messageIndex = conversation.messages.findIndex(
        (message) => message.id === messageId && message.role === "user"
      );

      if (messageIndex < 0) {
        return null;
      }

      const timestamp = nowIso();
      const normalizedContent = content.trim();
      const existingMessage = conversation.messages[messageIndex];
      const nextAttachments = attachments ?? existingMessage?.attachments ?? [];
      const nextTitle = normalizedContent
        ? normalizedContent.slice(0, 48)
        : nextAttachments[0]?.name ?? conversation.title;
      const matchedConnections = resolveMentionedConnections(
        normalizedContent,
        currentState.connections
      );
      const executionPlan = buildToolExecutionPlan({
        connections: matchedConnections,
        initialTimestamp: timestamp,
      });
      const executionVersion = bumpConversationExecutionVersion(conversationId);

      store.setState((current) => ({
        ...current,
        conversations: current.conversations.map((item) => {
          if (item.id !== conversationId) {
            return item;
          }

          const baseMessages = item.messages.slice(0, messageIndex);
          const editedMessage: ConversationMessage = {
            ...(item.messages[messageIndex] as ConversationMessage),
            content: normalizedContent,
            attachments: nextAttachments.length > 0 ? nextAttachments : undefined,
          };

          return {
            ...item,
            title: item.title.trim().length > 0 ? item.title : nextTitle,
            updatedAt: timestamp,
            messages: [...baseMessages, editedMessage],
          };
        }),
      }));

      if (executionPlan.length > 0) {
        streamAssistantMessage({
          store,
          conversationId,
          content: createToolPreface(executionPlan),
          executionVersion,
          startDelayMs: TOOL_PREFACE_DELAY_MS,
        });

        simulateToolExecution({
          store,
          conversationId,
          executionVersion,
          plan: executionPlan,
        });
      } else {
        streamAssistantMessage({
          store,
          conversationId,
          content: createDefaultAssistantReply(normalizedContent),
          executionVersion,
          startDelayMs: TOOL_PREFACE_DELAY_MS,
        });
      }

      return conversationId;
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
