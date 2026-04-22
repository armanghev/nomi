export type EventSeverity = "info" | "warning" | "critical";
export type EventStatus = "pending" | "success" | "failed" | "retrying";

export type AgentStatus = "healthy" | "running" | "degraded" | "failed";

export type ConnectionProvider =
  | "github"
  | "vercel"
  | "gmail"
  | "google_calendar"
  | "google_drive"
  | "notion"
  | "linear";
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
export type DashboardMetricId =
  | "criticalEvents"
  | "activeAgents"
  | "pausedTokens"
  | "avgLatencyMs"
  | "dailyCostUsd";

export type EventType =
  | "token.create"
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
  lastRunAt: string;
  lastRunStatus: "success" | "failed";
};

export type MemoryItem = {
  id: string;
  label: string;
  value: string;
  updatedAt: string;
  sourceCount: number;
  provenance: "manual" | "imported" | "derived";
};

export type Connection = {
  id: string;
  provider: ConnectionProvider;
  appName: string;
  accountEmail: string;
  status: ConnectionStatus;
  scopes: string[];
  availableTools: string[];
  lastSyncAt: string | null;
  healthScore: number;
};

export type ToolCallStatus = "running" | "success" | "failed";

export type ToolCall = {
  id: string;
  connectionId: string;
  provider: ConnectionProvider;
  appName: string;
  accountEmail: string;
  toolName: string;
  status: ToolCallStatus;
  startedAt: string;
  durationMs: number | null;
};

export type Token = {
  id: string;
  label: string;
  status: TokenStatus;
  lastUsedAt: string | null;
  dailyCostUsd: number;
  anomalyTags: string[];
};

export type Source = {
  id: string;
  label: string;
  pinned: boolean;
  conversationId: string;
  group: "memories" | "docs" | "telemetry";
};

export type ConversationAttachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  fileExtension?: string;
  previewUrl?: string;
};

export type ConversationMessage = {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  createdAt: string;
  attachments?: ConversationAttachment[];
  toolCall?: ToolCall;
  toolCalls?: ToolCall[];
};

export type Conversation = {
  id: string;
  title: string;
  sourceIds: string[];
  updatedAt: string;
  messages: ConversationMessage[];
};

export type ModelRun = {
  id: string;
  agentId: string;
  conversationId: string;
  model: string;
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
  toolCalls: ToolCall[];
  tokens: Token[];
  events: DomainEvent[];
  conversations: Conversation[];
  sources: Source[];
  modelRuns: ModelRun[];
  inspectorSelection: InspectorSelection | null;
};

export type MemoryUpdate = Partial<Pick<MemoryItem, "label" | "value">>;
export type TokenCreateInput = {
  label: string;
  dailyCostUsd: number;
};

export type InspectorSelection =
  | { kind: "dashboard-metric"; id: DashboardMetricId }
  | { kind: "agent"; id: string }
  | { kind: "memory"; id: string }
  | { kind: "connection"; id: string }
  | { kind: "token"; id: string }
  | { kind: "event"; id: string };
