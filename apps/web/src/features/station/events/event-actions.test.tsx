import { describe, expect, it } from "vitest";
import { createMockDomainActions } from "@/features/mock-domain/actions";
import { createSeededMockDomainState } from "@/features/mock-domain/seed";
import { createMockDomainStore } from "@/features/mock-domain/store";

describe("event actions", () => {
  it("marks events as acknowledged and resolved", () => {
    const store = createMockDomainStore(createSeededMockDomainState(6));
    const actions = createMockDomainActions(store);
    const eventId = store.getState().events[0]?.id;

    expect(eventId).toBeDefined();

    actions.ackEvent(eventId as string);
    actions.resolveEvent(eventId as string);

    const next = store.getState();
    const event = next.events.find((item) => item.id === eventId);

    expect(event?.acknowledged).toBe(true);
    expect(event?.resolved).toBe(true);
  });

  it("records explicit retry lifecycle stages", () => {
    const store = createMockDomainStore(createSeededMockDomainState(14));
    const actions = createMockDomainActions(store);
    const agentId = store.getState().agents[0]?.id;

    expect(agentId).toBeDefined();

    actions.retryRun(agentId as string, { shouldFail: false });

    const timeline = store
      .getState()
      .events.filter((item) => item.entityId === agentId && item.type === "agent.retry")
      .slice(0, 3)
      .map((item) => item.message);

    expect(timeline).toEqual([
      "Retry completed successfully.",
      "Retry running.",
      "Retry queued.",
    ]);
  });
});
