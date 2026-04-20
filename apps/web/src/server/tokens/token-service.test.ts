import { describe, expect, it, vi } from "vitest";
import { createTokenService } from "./token-service";

describe("createTokenService", () => {
  it("returns the plaintext token once and stores only a hash", async () => {
    const insertToken = vi.fn().mockResolvedValue({ id: "tok_1" });
    const service = createTokenService({
      insertToken,
      listTokens: vi.fn(),
      revokeToken: vi.fn(),
      writeAudit: vi.fn()
    });

    const created = await service.create({
      ownerId: "owner_1",
      label: "iPhone"
    });

    expect(created.plaintextToken.startsWith("nomi_")).toBe(true);
    expect(insertToken).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenHash: expect.any(String)
      })
    );
    expect(insertToken).not.toHaveBeenCalledWith(
      expect.objectContaining({
        tokenHash: created.plaintextToken
      })
    );
  });
});
