import { describe, expect, it } from "vitest";
import { readEnv } from "./env";

describe("readEnv", () => {
  it("throws when OWNER_EMAIL is missing", () => {
    expect(() =>
      readEnv({
        AUTH_SECRET: "secret",
        AUTH_GOOGLE_ID: "google-id",
        AUTH_GOOGLE_SECRET: "google-secret",
        DATABASE_URL: "postgres://user:pass@host/db",
        OPENAI_API_KEY: "key"
      })
    ).toThrow("OWNER_EMAIL");
  });

  it("returns a typed env object when all required values exist", () => {
    expect(
      readEnv({
        AUTH_SECRET: "secret",
        AUTH_GOOGLE_ID: "google-id",
        AUTH_GOOGLE_SECRET: "google-secret",
        DATABASE_URL: "postgres://user:pass@host/db",
        OPENAI_API_KEY: "key",
        OWNER_EMAIL: "you@example.com"
      }).OWNER_EMAIL
    ).toBe("you@example.com");
  });
});
