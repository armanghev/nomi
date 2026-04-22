import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSeededMockDomainState } from "./seed";
import { createMockDomainStore } from "./store";
import { createMockDomainActions } from "./actions";

describe("mock domain store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

  it("simulates inline tool execution states and final assistant summary", () => {
    const state = createSeededMockDomainState(13);
    const store = createMockDomainStore(state);
    const actions = createMockDomainActions(store);
    const conversationId = store.getState().conversations[0]?.id;

    expect(conversationId).toBeDefined();

    actions.sendConversationMessage(
      conversationId as string,
      "Use GitHub to check my latest PR."
    );

    vi.advanceTimersByTime(220);

    let next = store.getState();
    let conversation = next.conversations.find((item) => item.id === conversationId);
    const prefaceMessage = conversation?.messages.at(-1);
    let runningToolMessage = conversation?.messages.find((message) => message.role === "tool");

    expect(prefaceMessage?.role).toBe("assistant");
    expect((prefaceMessage?.content ?? "").length).toBeGreaterThan(0);
    expect(runningToolMessage).toBeUndefined();

    vi.advanceTimersByTime(900);
    next = store.getState();
    conversation = next.conversations.find((item) => item.id === conversationId);
    runningToolMessage = conversation?.messages.find((message) => message.role === "tool");

    expect(runningToolMessage?.toolCall?.provider).toBe("github");
    expect(runningToolMessage?.toolCall?.status).toBe("running");

    vi.advanceTimersByTime(2_800);

    next = store.getState();
    conversation = next.conversations.find((item) => item.id === conversationId);
    runningToolMessage = conversation?.messages.find((message) => message.role === "tool");
    const assistantMessage = conversation?.messages.at(-1);

    expect(runningToolMessage?.toolCall?.status).toBe("failed");
    expect(assistantMessage?.role).toBe("assistant");
    expect(assistantMessage?.content).toContain("Tool execution finished");
    expect(next.toolCalls[0]?.provider).toBe("github");
    expect(next.toolCalls[0]?.status).toBe("failed");
  });

  it("stores user attachments on conversation messages", () => {
    const state = createSeededMockDomainState(17);
    const store = createMockDomainStore(state);
    const actions = createMockDomainActions(store);
    const conversationId = store.getState().conversations[0]?.id;

    expect(conversationId).toBeDefined();

    actions.sendConversationMessage(conversationId as string, "See attached.", [
      {
        id: "attachment-1",
        name: "deploy-plan.pdf",
        mimeType: "application/pdf",
        size: 2048,
        fileExtension: "PDF",
      },
    ]);

    const next = store.getState();
    const conversation = next.conversations.find((item) => item.id === conversationId);
    const lastUserMessage = [...(conversation?.messages ?? [])]
      .reverse()
      .find((message) => message.role === "user");

    expect(lastUserMessage?.attachments).toEqual([
      {
        id: "attachment-1",
        name: "deploy-plan.pdf",
        mimeType: "application/pdf",
        size: 2048,
        fileExtension: "PDF",
      },
    ]);
  });
});
