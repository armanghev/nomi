import Nodemailer from "next-auth/providers/nodemailer";
import {
  buildEdgeAuthProviders,
  isMagicLinkConfigured,
  type AuthProviderConfigInput,
} from "./auth-provider-config";

export function buildNodeAuthProviders(config: AuthProviderConfigInput) {
  const providers = buildEdgeAuthProviders(config);

  if (isMagicLinkConfigured(config)) {
    providers.push(
      Nodemailer({
        server: config.emailServer,
        from: config.emailFrom,
      })
    );
  }

  return providers;
}
