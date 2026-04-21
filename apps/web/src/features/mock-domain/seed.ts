import type {
  Agent,
  Connection,
  Conversation,
  DomainEvent,
  MemoryItem,
  MockDomainState,
  ModelRun,
  Source,
  Token,
} from "./types";

function mulberry32(seed: number) {
  let value = seed;

  return function next() {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildId(prefix: string, seed: number, index: number) {
  return `${prefix}-${seed}-${index}`;
}

function buildTimestamp(minutesOffset: number) {
  const base = new Date("2026-04-20T07:00:00.000Z");
  base.setMinutes(base.getMinutes() - minutesOffset);
  return base.toISOString();
}

export function createSeededMockDomainState(seed = 1): MockDomainState {
  const rand = mulberry32(seed);

  const conversations: Conversation[] = [
    {
      id: buildId("conv", seed, 1),
      title: "Operator baseline",
      sourceIds: [buildId("source", seed, 1), buildId("source", seed, 2)],
      updatedAt: buildTimestamp(2),
    },
    {
      id: buildId("conv", seed, 2),
      title: "Deploy checklist",
      sourceIds: [buildId("source", seed, 3)],
      updatedAt: buildTimestamp(18),
    },
  ];

  const sources: Source[] = [
    {
      id: buildId("source", seed, 1),
      label: "neon query log",
      pinned: true,
      conversationId: conversations[0].id,
    },
    {
      id: buildId("source", seed, 2),
      label: "memory profile",
      pinned: false,
      conversationId: conversations[0].id,
    },
    {
      id: buildId("source", seed, 3),
      label: "release notebook",
      pinned: true,
      conversationId: conversations[1].id,
    },
  ];

  const agents: Agent[] = [
    {
      id: buildId("agent", seed, 1),
      name: "Scheduler",
      status: "healthy",
      activeRuns: 2,
      failureRate: Number((rand() * 0.12).toFixed(2)),
    },
    {
      id: buildId("agent", seed, 2),
      name: "Planner",
      status: "running",
      activeRuns: 1,
      failureRate: Number((rand() * 0.1).toFixed(2)),
    },
    {
      id: buildId("agent", seed, 3),
      name: "Retriever",
      status: "degraded",
      activeRuns: 3,
      failureRate: Number((0.12 + rand() * 0.1).toFixed(2)),
    },
  ];

  const memories: MemoryItem[] = [
    {
      id: buildId("memory", seed, 1),
      label: "response style",
      value: "Keep responses concise and action-first.",
      updatedAt: buildTimestamp(9),
      sourceCount: 8,
    },
    {
      id: buildId("memory", seed, 2),
      label: "infra defaults",
      value: "Prefer Neon + Drizzle + Vercel AI SDK.",
      updatedAt: buildTimestamp(47),
      sourceCount: 3,
    },
  ];

  const connections: Connection[] = [
    {
      id: buildId("connection", seed, 1),
      provider: "google",
      status: "connected",
      scopes: ["profile", "email", "classroom.readonly"],
      lastSyncAt: buildTimestamp(14),
    },
    {
      id: buildId("connection", seed, 2),
      provider: "github",
      status: "degraded",
      scopes: ["repo", "read:user"],
      lastSyncAt: buildTimestamp(31),
    },
  ];

  const tokens: Token[] = [
    {
      id: buildId("token", seed, 1),
      label: "Local MacBook",
      status: "active",
      lastUsedAt: buildTimestamp(4),
      dailyCostUsd: Number((0.4 + rand() * 0.8).toFixed(2)),
    },
    {
      id: buildId("token", seed, 2),
      label: "iOS simulator",
      status: "paused",
      lastUsedAt: buildTimestamp(95),
      dailyCostUsd: Number((0.2 + rand() * 0.4).toFixed(2)),
    },
  ];

  const modelRuns: ModelRun[] = Array.from({ length: 6 }, (_, index) => ({
    id: buildId("run", seed, index + 1),
    conversationId: conversations[index % conversations.length].id,
    latencyMs: Math.round(550 + rand() * 1400),
    costUsd: Number((0.01 + rand() * 0.07).toFixed(3)),
    status: rand() > 0.85 ? "failed" : "success",
    createdAt: buildTimestamp(index * 6 + 3),
  }));

  const events: DomainEvent[] = [
    {
      id: buildId("event", seed, 1),
      type: "connection.connect",
      severity: "warning",
      status: "failed",
      message: "GitHub reconnect failed due to expired token.",
      entityId: connections[1].id,
      createdAt: buildTimestamp(8),
      acknowledged: false,
      resolved: false,
    },
    {
      id: buildId("event", seed, 2),
      type: "agent.retry",
      severity: "info",
      status: "success",
      message: "Planner run retry completed successfully.",
      entityId: agents[1].id,
      createdAt: buildTimestamp(12),
      acknowledged: true,
      resolved: true,
    },
    {
      id: buildId("event", seed, 3),
      type: "token.pause",
      severity: "info",
      status: "success",
      message: "iOS simulator token was paused by operator.",
      entityId: tokens[1].id,
      createdAt: buildTimestamp(24),
      acknowledged: true,
      resolved: true,
    },
  ];

  return {
    agents,
    memories,
    connections,
    tokens,
    events,
    conversations,
    sources,
    modelRuns,
  };
}
