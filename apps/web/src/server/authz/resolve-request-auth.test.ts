import { describe, expect, it } from "vitest";
import { resolveRequestAuth } from "./resolve-request-auth";

describe("resolveRequestAuth", () => {
  it("prefers a bearer token when present", async () => {
    const request = new Request("http://localhost/api/chat", {
      headers: {
        authorization: "Bearer nomi_token_example"
      }
    });

    const result = await resolveRequestAuth(request);

    expect(result?.authMethod).toBe("token");
  });
});
