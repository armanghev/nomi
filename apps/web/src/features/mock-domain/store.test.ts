import { describe, expect, it } from "vitest";
import { createSeededMockDomainState } from "./seed";
import { createMockDomainStore } from "./store";
import { createMockDomainActions } from "./actions";

describe("mock domain store", () => {
  it("creates deterministic seed data for a given seed", () => {
    const first = createSeededMockDomainState(42);
    const second = createSeededMockDomainState(42);

    expect(first).toStrictEqual(second);
  });

  it("pauses a token by emitting an event and updating token state", () => {
    const state = createSeededMockDomainState(7);
    const store = createMockDomainStore(state);
    const actions = createMockDomainActions(store);
    const tokenId = store.getState().tokens[0]?.id;

    expect(tokenId).toBeDefined();

    actions.pauseToken(tokenId as string);

    const next = store.getState();
    expect(next.tokens[0]?.status).toBe("paused");
    expect(next.events[0]?.type).toBe("token.pause");
    expect(next.events[0]?.status).toBe("success");
  });

  it("edits memory and records a memory update event", () => {
    const state = createSeededMockDomainState(9);
    const store = createMockDomainStore(state);
    const actions = createMockDomainActions(store);
    const memoryId = store.getState().memories[0]?.id;

    expect(memoryId).toBeDefined();

    actions.editMemory(memoryId as string, { value: "Use concise bullet points." });

    const next = store.getState();
    expect(next.memories[0]?.value).toBe("Use concise bullet points.");
    expect(next.events[0]?.type).toBe("memory.update");
    expect(next.events[0]?.status).toBe("success");
  });

  it("updates inspector selection when an item is selected", () => {
    const state = createSeededMockDomainState(11);
    const store = createMockDomainStore(state);
    const actions = createMockDomainActions(store);
    const agentId = store.getState().agents[0]?.id;

    expect(agentId).toBeDefined();

    actions.selectInspector({ kind: "agent", id: agentId as string });

    expect(store.getState().inspectorSelection).toEqual({
      kind: "agent",
      id: agentId,
    });
  });
});
