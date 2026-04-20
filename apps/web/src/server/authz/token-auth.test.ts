import { describe, expect, it, vi } from "vitest";
import { lookupActiveTokenOwnerId } from "./token-auth";

describe("lookupActiveTokenOwnerId", () => {
  it("updates lastUsedAt and writes a token-use audit log for active tokens", async () => {
    const markTokenUsed = vi.fn().mockResolvedValue(undefined);
    const writeAudit = vi.fn().mockResolvedValue(undefined);
    const now = new Date("2026-04-20T12:00:00.000Z");

    const ownerId = await lookupActiveTokenOwnerId("token_hash", {
      findActiveToken: vi.fn().mockResolvedValue({
        id: "token_1",
        ownerId: "owner_1"
      }),
      markTokenUsed,
      writeAudit,
      now: () => now
    });

    expect(ownerId).toBe("owner_1");
    expect(markTokenUsed).toHaveBeenCalledWith("token_1", now);
    expect(writeAudit).toHaveBeenCalledWith({
      ownerId: "owner_1",
      authMethod: "token",
      action: "token.used",
      resourceType: "api_token",
      resourceId: "token_1",
      metadata: {
        tokenHash: "token_hash"
      }
    });
  });

  it("returns null without writing usage state when the token is not active", async () => {
    const markTokenUsed = vi.fn().mockResolvedValue(undefined);
    const writeAudit = vi.fn().mockResolvedValue(undefined);

    const ownerId = await lookupActiveTokenOwnerId("token_hash", {
      findActiveToken: vi.fn().mockResolvedValue(null),
      markTokenUsed,
      writeAudit
    });

    expect(ownerId).toBeNull();
    expect(markTokenUsed).not.toHaveBeenCalled();
    expect(writeAudit).not.toHaveBeenCalled();
  });
});
