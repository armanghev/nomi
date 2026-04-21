export type EventSeverity = "info" | "warning" | "critical";
export type EventStatus = "pending" | "success" | "failed" | "retrying";

export type AgentStatus = "healthy" | "running" | "degraded" | "failed";

export type ConnectionProvider = "google" | "github";
export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "consent_review"
  | "callback_pending"
  | "connected"
  | "degraded"
  | "disconnecting"
  | "failed";

export type TokenStatus = "active" | "paused" | "revoked";

export type EventType =
  | "token.pause"
  | "token.resume"
  | "token.revoke"
  | "memory.update"
  | "memory.delete"
  | "connection.connect"
  | "connection.disconnect"
  | "agent.retry"
  | "chat.rerun"
  | "event.ack"
  | "event.resolve"
  | "source.pin"
  | "source.unpin";

export type Agent = {
  id: string;
  name: string;
  status: AgentStatus;
  activeRuns: number;
  failureRate: number;
};

export type MemoryItem = {
  id: string;
  label: string;
  value: string;
  updatedAt: string;
  sourceCount: number;
};

export type Connection = {
  id: string;
  provider: ConnectionProvider;
  status: ConnectionStatus;
  scopes: string[];
  lastSyncAt: string | null;
};

export type Token = {
  id: string;
  label: string;
  status: TokenStatus;
  lastUsedAt: string | null;
  dailyCostUsd: number;
};

export type Source = {
  id: string;
  label: string;
  pinned: boolean;
  conversationId: string;
};

export type Conversation = {
  id: string;
  title: string;
  sourceIds: string[];
  updatedAt: string;
};

export type ModelRun = {
  id: string;
  conversationId: string;
  latencyMs: number;
  costUsd: number;
  status: "success" | "failed";
  createdAt: string;
};

export type DomainEvent = {
  id: string;
  type: EventType;
  severity: EventSeverity;
  status: EventStatus;
  message: string;
  entityId: string;
  createdAt: string;
  acknowledged: boolean;
  resolved: boolean;
};

export type MockDomainState = {
  agents: Agent[];
  memories: MemoryItem[];
  connections: Connection[];
  tokens: Token[];
  events: DomainEvent[];
  conversations: Conversation[];
  sources: Source[];
  modelRuns: ModelRun[];
};

export type MemoryUpdate = Partial<Pick<MemoryItem, "label" | "value">>;
