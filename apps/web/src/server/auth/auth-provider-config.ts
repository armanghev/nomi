import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export type AuthProviderConfigInput = {
  googleClientId: string;
  googleClientSecret: string;
  emailServer?: string;
  emailFrom?: string;
};

function buildGoogleProvider(config: AuthProviderConfigInput) {
  return Google({
    clientId: config.googleClientId,
    clientSecret: config.googleClientSecret,
  });
}

export function isMagicLinkConfigured(config: {
  emailServer?: string;
  emailFrom?: string;
}): boolean {
  return Boolean(config.emailServer?.trim() && config.emailFrom?.trim());
}

export function buildEdgeAuthProviders(config: AuthProviderConfigInput) {
  const providers: NonNullable<NextAuthConfig["providers"]> = [
    buildGoogleProvider(config),
  ];

  return providers;
}
