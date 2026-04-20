import { describe, expect, it } from "vitest";
import { readAiEnv, readEnv } from "./env";

describe("readEnv", () => {
  it("throws when OWNER_EMAIL is missing", () => {
    expect(() =>
      readEnv({
        AUTH_SECRET: "secret",
        AUTH_GOOGLE_ID: "google-id",
        AUTH_GOOGLE_SECRET: "google-secret",
        DATABASE_URL: "postgres://user:pass@host/db",
        GOOGLE_GENERATIVE_AI_API_KEY: "key"
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
        GOOGLE_GENERATIVE_AI_API_KEY: "key",
        OWNER_EMAIL: "you@example.com"
      }).OWNER_EMAIL
    ).toBe("you@example.com");
  });

  it("reads only the AI env contract for chat generation", () => {
    expect(
      readAiEnv({
        GOOGLE_GENERATIVE_AI_API_KEY: "key"
      }).GEMINI_MODEL
    ).toBe("gemini-3-flash-preview");
  });

  it("does not require unrelated app env vars for AI access", () => {
    expect(
      readAiEnv({
        GOOGLE_GENERATIVE_AI_API_KEY: "key",
        GEMINI_MODEL: "gemini-3-flash-preview"
      }).GOOGLE_GENERATIVE_AI_API_KEY
    ).toBe("key");
  });
});
