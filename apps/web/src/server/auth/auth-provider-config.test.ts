import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildEdgeAuthProviders,
  isMagicLinkConfigured,
} from "./auth-provider-config";
import { buildNodeAuthProviders } from "./node-auth-provider-config";

describe("auth-provider-config", () => {
  const authDirectory = dirname(import.meta.filename);

  function providerIds(
    providers:
      | ReturnType<typeof buildEdgeAuthProviders>
      | ReturnType<typeof buildNodeAuthProviders>
  ) {
    return providers.map((provider) => (provider as { id: string }).id);
  }

  it("keeps the edge-safe provider list free of nodemailer", () => {
    const providers = buildEdgeAuthProviders({
      googleClientId: "google-id",
      googleClientSecret: "google-secret",
    });

    expect(providerIds(providers)).toEqual(["google"]);
  });

  it("keeps nodemailer imports out of modules used by the edge auth config", () => {
    const edgeAuthConfigSource = readFileSync(
      resolve(authDirectory, "../../auth.config.ts"),
      "utf8"
    );
    const edgeProviderSource = readFileSync(
      resolve(authDirectory, "./auth-provider-config.ts"),
      "utf8"
    );

    expect(edgeAuthConfigSource).not.toContain("providers/nodemailer");
    expect(edgeProviderSource).not.toContain("providers/nodemailer");
  });

  it("adds magic-link auth only to the node runtime provider list when fully configured", () => {
    const providersWithoutMagicLink = buildNodeAuthProviders({
      googleClientId: "google-id",
      googleClientSecret: "google-secret",
    });
    const providersWithMagicLink = buildNodeAuthProviders({
      googleClientId: "google-id",
      googleClientSecret: "google-secret",
      emailServer: "smtp://user:pass@smtp.example.com:587",
      emailFrom: "Nomi <owner@example.com>",
    });

    expect(providerIds(providersWithoutMagicLink)).toEqual(["google"]);
    expect(providerIds(providersWithMagicLink)).toEqual([
      "google",
      "nodemailer",
    ]);
  });

  it("requires both email server and sender details before enabling magic links", () => {
    expect(
      isMagicLinkConfigured({
        emailServer: "smtp://user:pass@smtp.example.com:587",
      })
    ).toBe(false);
    expect(
      isMagicLinkConfigured({
        emailFrom: "Nomi <owner@example.com>",
      })
    ).toBe(false);
    expect(
      isMagicLinkConfigured({
        emailServer: "smtp://user:pass@smtp.example.com:587",
        emailFrom: "Nomi <owner@example.com>",
      })
    ).toBe(true);
  });
});
