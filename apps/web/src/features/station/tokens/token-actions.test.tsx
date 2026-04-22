import { describe, expect, it } from "vitest";
import { createMockDomainActions } from "@/features/mock-domain/actions";
import { createSeededMockDomainState } from "@/features/mock-domain/seed";
import { createMockDomainStore } from "@/features/mock-domain/store";
import { selectDashboardSummary } from "@/features/mock-domain/selectors";

describe("token actions", () => {
  it("creates a token and emits a successful event", () => {
    const store = createMockDomainStore(createSeededMockDomainState(10));
    const actions = createMockDomainActions(store);

    actions.createToken({
      label: "CI runner",
      dailyCostUsd: 1.23,
    });

    const next = store.getState();

    expect(next.tokens.some((token) => token.label === "CI runner")).toBe(true);
    expect(next.events[0]?.type).toBe("token.create");
    expect(next.events[0]?.status).toBe("success");
  });

  it("revokes a token and dashboard selectors reflect changes", () => {
    const store = createMockDomainStore(createSeededMockDomainState(12));
    const actions = createMockDomainActions(store);
    const tokenId = store.getState().tokens[0]?.id;

    expect(tokenId).toBeDefined();

    actions.pauseToken(tokenId as string);
    actions.revokeToken(tokenId as string);

    const next = store.getState();
    const token = next.tokens.find((item) => item.id === tokenId);

    expect(token?.status).toBe("revoked");

    const summary = selectDashboardSummary(next);
    expect(summary.pausedTokens).toBeGreaterThanOrEqual(1);
    expect(next.events[0]?.type).toBe("token.revoke");
  });
});
