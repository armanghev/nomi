import { describe, expect, it, vi } from "vitest";
import { createTokenService } from "./token-service";

describe("createTokenService", () => {
  it("returns the plaintext token once and stores only a hash in one transaction", async () => {
    const insertToken = vi.fn().mockResolvedValue({ id: "tok_1" });
    const writeAudit = vi.fn();
    const transaction = vi.fn(async (callback) =>
      callback({
        insertToken,
        revokeToken: vi.fn(),
        writeAudit
      })
    );
    const service = createTokenService({
      transaction,
      listTokens: vi.fn()
    });

    const created = await service.create({
      ownerId: "owner_1",
      label: "iPhone"
    });

    expect(created.plaintextToken.startsWith("nomi_")).toBe(true);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(insertToken).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: "owner_1",
        label: "iPhone",
        tokenHash: expect.any(String)
      })
    );
    expect(insertToken).not.toHaveBeenCalledWith(
      expect.objectContaining({
        tokenHash: created.plaintextToken
      })
    );
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "token.created",
        resourceType: "api_token"
      })
    );
  });

  it("revokes a token and writes an audit log in one transaction", async () => {
    const revokeToken = vi.fn();
    const writeAudit = vi.fn();
    const transaction = vi.fn(async (callback) =>
      callback({
        insertToken: vi.fn(),
        revokeToken,
        writeAudit
      })
    );
    const service = createTokenService({
      transaction,
      listTokens: vi.fn()
    });

    await service.revoke({
      ownerId: "owner_1",
      id: "tok_1"
    });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(revokeToken).toHaveBeenCalledWith({
      ownerId: "owner_1",
      id: "tok_1"
    });
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "token.revoked",
        resourceType: "api_token"
      })
    );
  });
});
