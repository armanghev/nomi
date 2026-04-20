import { beforeEach, describe, expect, it, vi } from "vitest";

const resolveRequestAuth = vi.fn();

vi.mock("@/db", () => ({
  db: {}
}));

vi.mock("@/server/authz/resolve-request-auth", () => ({
  resolveRequestAuth
}));

vi.mock("@/server/authz/token-auth", () => ({
  lookupActiveTokenOwnerId: vi.fn()
}));

vi.mock("@/server/ai/model", () => ({
  generateAssistantReply: vi.fn()
}));

vi.mock("@/server/audit/audit-log", () => ({
  writeAuditLog: vi.fn()
}));

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.resetModules();
    resolveRequestAuth.mockReset();
    resolveRequestAuth.mockResolvedValue({
      ownerId: "owner_1",
      authMethod: "session"
    });
  });

  it("returns 400 when the request body is invalid JSON", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: "{"
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid request body"
    });
  });

  it("returns 400 when the request body does not match the schema", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        conversationId: "not-a-uuid",
        content: ""
      })
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid request body"
    });
  });
});
