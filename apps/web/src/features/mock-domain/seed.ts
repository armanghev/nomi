import type {
  Agent,
  Connection,
  Conversation,
  DomainEvent,
  MemoryItem,
  MockDomainState,
  ModelRun,
  Source,
  ToolCall,
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

function buildConversationId(seed: number, index: number) {
  const rand = mulberry32(seed * 1_000 + index);
  const bytes = new Uint8Array(16);

  for (let byteIndex = 0; byteIndex < bytes.length; byteIndex += 1) {
    bytes[byteIndex] = Math.floor(rand() * 256);
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join(
    ""
  );

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20
  )}-${hex.slice(20)}`;
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
      id: buildConversationId(seed, 1),
      title: "Operator baseline",
      sourceIds: [buildId("source", seed, 1), buildId("source", seed, 2)],
      updatedAt: buildTimestamp(2),
      messages: [
        {
          id: buildId("message", seed, 1),
          role: "user",
          content: "Give me the current system health summary.",
          createdAt: buildTimestamp(5),
        },
        {
          id: buildId("message", seed, 2),
          role: "assistant",
          content:
            "Two active agents are healthy, one is degraded, and there is one unresolved critical event.",
          createdAt: buildTimestamp(4),
        },
      ],
    },
    {
      id: buildConversationId(seed, 2),
      title: "Deploy checklist",
      sourceIds: [buildId("source", seed, 3)],
      updatedAt: buildTimestamp(18),
      messages: [
        {
          id: buildId("message", seed, 3),
          role: "user",
          content: "What should I verify before the next deploy?",
          createdAt: buildTimestamp(22),
        },
        {
          id: buildId("message", seed, 4),
          role: "assistant",
          content:
            "Confirm tokens are active, GitHub connection is healthy, and failures are acknowledged in Events.",
          createdAt: buildTimestamp(21),
        },
      ],
    },
  ];

  const sources: Source[] = [
    {
      id: buildId("source", seed, 1),
      label: "neon query log",
      pinned: true,
      conversationId: conversations[0].id,
      group: "telemetry",
    },
    {
      id: buildId("source", seed, 2),
      label: "memory profile",
      pinned: false,
      conversationId: conversations[0].id,
      group: "memories",
    },
    {
      id: buildId("source", seed, 3),
      label: "release notebook",
      pinned: true,
      conversationId: conversations[1].id,
      group: "docs",
    },
  ];

  const agents: Agent[] = [
    {
      id: buildId("agent", seed, 1),
      name: "Scheduler",
      status: "healthy",
      activeRuns: 2,
      failureRate: Number((rand() * 0.12).toFixed(2)),
      lastRunAt: buildTimestamp(3),
      lastRunStatus: "success",
    },
    {
      id: buildId("agent", seed, 2),
      name: "Planner",
      status: "running",
      activeRuns: 1,
      failureRate: Number((rand() * 0.1).toFixed(2)),
      lastRunAt: buildTimestamp(6),
      lastRunStatus: "success",
    },
    {
      id: buildId("agent", seed, 3),
      name: "Retriever",
      status: "degraded",
      activeRuns: 3,
      failureRate: Number((0.12 + rand() * 0.1).toFixed(2)),
      lastRunAt: buildTimestamp(8),
      lastRunStatus: "failed",
    },
  ];

  const memories: MemoryItem[] = [
    {
      id: buildId("memory", seed, 1),
      label: "response style",
      value: "Keep responses concise and action-first.",
      updatedAt: buildTimestamp(9),
      sourceCount: 8,
      provenance: "manual",
    },
    {
      id: buildId("memory", seed, 2),
      label: "infra defaults",
      value: "Prefer Neon + Drizzle + Vercel AI SDK.",
      updatedAt: buildTimestamp(47),
      sourceCount: 3,
      provenance: "imported",
    },
  ];

  const connections: Connection[] = [
    {
      id: buildId("connection", seed, 1),
      provider: "gmail",
      appName: "Gmail",
      accountEmail: "arman.personal@gmail.com",
      status: "connected",
      scopes: ["openid", "email", "gmail.readonly", "gmail.send"],
      availableTools: ["search_threads", "read_message", "send_message", "reply_thread"],
      lastSyncAt: buildTimestamp(14),
      healthScore: 98,
    },
    {
      id: buildId("connection", seed, 2),
      provider: "github",
      appName: "GitHub",
      accountEmail: "armanghevondyan@users.noreply.github.com",
      status: "degraded",
      scopes: ["repo", "read:user"],
      availableTools: ["list_repos", "get_pr", "list_pr_files", "create_issue", "comment_pr"],
      lastSyncAt: buildTimestamp(31),
      healthScore: 61,
    },
    {
      id: buildId("connection", seed, 3),
      provider: "google_calendar",
      appName: "Google Calendar",
      accountEmail: "arman.school@gmail.com",
      status: "connected",
      scopes: ["openid", "email", "calendar.events"],
      availableTools: ["list_events", "create_event", "update_event", "delete_event"],
      lastSyncAt: buildTimestamp(9),
      healthScore: 94,
    },
    {
      id: buildId("connection", seed, 4),
      provider: "vercel",
      appName: "Vercel",
      accountEmail: "arman@nomi.dev",
      status: "connected",
      scopes: ["project.read", "deployment.read", "deployment.write"],
      availableTools: [
        "list_projects",
        "list_deployments",
        "get_deployment_logs",
        "redeploy",
      ],
      lastSyncAt: buildTimestamp(6),
      healthScore: 97,
    },
    {
      id: buildId("connection", seed, 5),
      provider: "google_drive",
      appName: "Google Drive",
      accountEmail: "arman.docs@gmail.com",
      status: "connected",
      scopes: ["openid", "email", "drive.readonly"],
      availableTools: ["search_files", "read_doc", "create_doc", "append_doc"],
      lastSyncAt: buildTimestamp(17),
      healthScore: 93,
    },
    {
      id: buildId("connection", seed, 6),
      provider: "notion",
      appName: "Notion",
      accountEmail: "arman@nomi.dev",
      status: "disconnected",
      scopes: ["pages.read", "pages.write", "database.read"],
      availableTools: ["search", "read_page", "create_page", "update_page"],
      lastSyncAt: null,
      healthScore: 42,
    },
    {
      id: buildId("connection", seed, 7),
      provider: "linear",
      appName: "Linear",
      accountEmail: "arman@nomi.dev",
      status: "connected",
      scopes: ["issues.read", "issues.write", "teams.read"],
      availableTools: ["search_issues", "get_issue", "create_issue", "update_issue"],
      lastSyncAt: buildTimestamp(28),
      healthScore: 89,
    },
  ];

  const toolCalls: ToolCall[] = [
    {
      id: buildId("tool-call", seed, 1),
      connectionId: connections[1].id,
      provider: "github",
      appName: "GitHub",
      accountEmail: connections[1].accountEmail,
      toolName: "get_pr",
      status: "failed",
      startedAt: buildTimestamp(2),
      durationMs: 1830,
    },
    {
      id: buildId("tool-call", seed, 2),
      connectionId: connections[3].id,
      provider: "vercel",
      appName: "Vercel",
      accountEmail: connections[3].accountEmail,
      toolName: "get_deployment_logs",
      status: "success",
      startedAt: buildTimestamp(5),
      durationMs: 640,
    },
    {
      id: buildId("tool-call", seed, 3),
      connectionId: connections[0].id,
      provider: "gmail",
      appName: "Gmail",
      accountEmail: connections[0].accountEmail,
      toolName: "search_threads",
      status: "success",
      startedAt: buildTimestamp(7),
      durationMs: 512,
    },
    {
      id: buildId("tool-call", seed, 4),
      connectionId: connections[2].id,
      provider: "google_calendar",
      appName: "Google Calendar",
      accountEmail: connections[2].accountEmail,
      toolName: "list_events",
      status: "success",
      startedAt: buildTimestamp(9),
      durationMs: 402,
    },
    {
      id: buildId("tool-call", seed, 5),
      connectionId: connections[4].id,
      provider: "google_drive",
      appName: "Google Drive",
      accountEmail: connections[4].accountEmail,
      toolName: "search_files",
      status: "running",
      startedAt: buildTimestamp(11),
      durationMs: null,
    },
    {
      id: buildId("tool-call", seed, 6),
      connectionId: connections[6].id,
      provider: "linear",
      appName: "Linear",
      accountEmail: connections[6].accountEmail,
      toolName: "create_issue",
      status: "success",
      startedAt: buildTimestamp(15),
      durationMs: 334,
    },
    {
      id: buildId("tool-call", seed, 7),
      connectionId: connections[5].id,
      provider: "notion",
      appName: "Notion",
      accountEmail: connections[5].accountEmail,
      toolName: "search",
      status: "failed",
      startedAt: buildTimestamp(19),
      durationMs: 1202,
    },
  ];

  const tokens: Token[] = [
    {
      id: buildId("token", seed, 1),
      label: "Local MacBook",
      status: "active",
      lastUsedAt: buildTimestamp(4),
      dailyCostUsd: Number((0.4 + rand() * 0.8).toFixed(2)),
      anomalyTags: [],
    },
    {
      id: buildId("token", seed, 2),
      label: "iOS simulator",
      status: "paused",
      lastUsedAt: buildTimestamp(95),
      dailyCostUsd: Number((0.2 + rand() * 0.4).toFixed(2)),
      anomalyTags: ["idle > 24h"],
    },
  ];

  const modelRuns: ModelRun[] = Array.from({ length: 6 }, (_, index) => {
    const failed = rand() > 0.85;
    return {
      id: buildId("run", seed, index + 1),
      agentId: agents[index % agents.length].id,
      conversationId: conversations[index % conversations.length].id,
      model: index % 2 === 0 ? "gpt-5.4" : "gpt-5.4-mini",
      latencyMs: Math.round(550 + rand() * 1400),
      costUsd: Number((0.01 + rand() * 0.07).toFixed(3)),
      status: failed ? "failed" : "success",
      createdAt: buildTimestamp(index * 6 + 3),
    };
  });

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
    toolCalls,
    tokens,
    events,
    conversations,
    sources,
    modelRuns,
    inspectorSelection: { kind: "dashboard-metric", id: "criticalEvents" },
  };
}
