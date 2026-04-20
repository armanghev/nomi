import { describe, expect, it, vi } from "vitest";
import { resolveRequestAuth } from "./resolve-request-auth";

describe("resolveRequestAuth", () => {
  it("returns token auth when the injected lookup resolves an owner id", async () => {
    const request = new Request("http://localhost/api/chat", {
      headers: {
        authorization: "Bearer nomi_token_example"
      }
    });

    const result = await resolveRequestAuth(request, {
      lookupTokenOwnerId: vi.fn().mockResolvedValue("owner_1")
    });

    expect(result).toEqual(
      expect.objectContaining({
        ownerId: "owner_1",
        authMethod: "token",
        tokenHash: expect.any(String)
      })
    );
  });

  it("rejects bearer token auth when no token lookup dependency is provided", async () => {
    const request = new Request("http://localhost/api/chat", {
      headers: {
        authorization: "Bearer nomi_token_example"
      }
    });

    const result = await resolveRequestAuth(request);

    expect(result).toBeNull();
  });

  it("falls back to session auth when no bearer token is present", async () => {
    const request = new Request("http://localhost/api/chat");

    const result = await resolveRequestAuth(request, {
      getSession: vi.fn().mockResolvedValue({
        user: {
          id: "owner_session"
        }
      })
    });

    expect(result).toEqual({
      ownerId: "owner_session",
      authMethod: "session"
    });
  });
});
