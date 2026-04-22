import { describe, expect, it } from "vitest";
import { createMockDomainActions } from "@/features/mock-domain/actions";
import { createSeededMockDomainState } from "@/features/mock-domain/seed";
import { createMockDomainStore } from "@/features/mock-domain/store";

describe("connections oauth flow", () => {
  it("walks through connect transitions and resolves connected", () => {
    const store = createMockDomainStore(createSeededMockDomainState(4));
    const actions = createMockDomainActions(store);
    const connectionId = store.getState().connections[1]?.id;

    expect(connectionId).toBeDefined();

    actions.reconnectConnection(connectionId as string, { shouldFail: false });

    const next = store.getState();
    const connection = next.connections.find((item) => item.id === connectionId);

    expect(connection?.status).toBe("connected");

    const lifecycleMessages = next.events
      .filter((event) => event.entityId === connectionId)
      .map((event) => event.message);

    expect(lifecycleMessages).toEqual(
      expect.arrayContaining([
        "Connection queued.",
        "Connection consent review.",
        "Connection callback pending.",
        "Connection established.",
      ])
    );
  });

  it("rolls back to previous status when reconnect fails", () => {
    const store = createMockDomainStore(createSeededMockDomainState(8));
    const actions = createMockDomainActions(store);
    const connectionId = store.getState().connections[1]?.id;
    const previousStatus = store.getState().connections[1]?.status;

    expect(connectionId).toBeDefined();
    expect(previousStatus).toBeDefined();

    actions.reconnectConnection(connectionId as string, { shouldFail: true });

    const next = store.getState();
    const connection = next.connections.find((item) => item.id === connectionId);

    expect(connection?.status).toBe(previousStatus);

    const failedEvent = next.events.find(
      (event) => event.entityId === connectionId && event.status === "failed"
    );

    expect(failedEvent?.message).toBe("Connection failed and rolled back.");
  });
});
