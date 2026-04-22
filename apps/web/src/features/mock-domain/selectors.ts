import type { MockDomainState } from "./types";

export function selectDashboardSummary(state: MockDomainState) {
  const criticalEvents = state.events.filter(
    (event) => event.severity === "critical" || event.status === "failed"
  ).length;
  const retryingEvents = state.events.filter(
    (event) => event.status === "retrying"
  ).length;
  const failedEvents = state.events.filter((event) => event.status === "failed")
    .length;
  const activeAgents = state.agents.filter(
    (agent) => agent.status === "healthy" || agent.status === "running"
  ).length;
  const pausedTokens = state.tokens.filter(
    (token) => token.status === "paused"
  ).length;

  const avgLatencyMs =
    state.modelRuns.length === 0
      ? 0
      : Math.round(
          state.modelRuns.reduce((sum, run) => sum + run.latencyMs, 0) /
            state.modelRuns.length
        );

  const dailyCostUsd = Number(
    state.tokens
      .reduce((sum, token) => sum + token.dailyCostUsd, 0)
      .toFixed(2)
  );

  return {
    criticalEvents,
    retryingEvents,
    failedEvents,
    activeAgents,
    pausedTokens,
    avgLatencyMs,
    dailyCostUsd,
  };
}

export function selectConversationSources(
  state: MockDomainState,
  conversationId: string
) {
  return state.sources.filter((source) => source.conversationId === conversationId);
}

export function selectAgentRuns(state: MockDomainState, agentId: string) {
  return state.modelRuns
    .filter((run) => run.agentId === agentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function selectRecentFailureEvents(state: MockDomainState, count = 6) {
  return state.events
    .filter(
      (event) =>
        event.status === "failed" ||
        event.status === "retrying" ||
        event.severity === "critical"
    )
    .slice(0, count);
}
