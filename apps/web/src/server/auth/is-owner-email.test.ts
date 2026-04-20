import { describe, expect, it } from "vitest";
import { isOwnerEmail } from "./is-owner-email";

describe("isOwnerEmail", () => {
  it("matches the configured owner email case-insensitively", () => {
    expect(isOwnerEmail("You@Example.com", "you@example.com")).toBe(true);
  });

  it("rejects non-owner emails", () => {
    expect(isOwnerEmail("other@example.com", "you@example.com")).toBe(false);
  });
});
