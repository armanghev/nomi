import { createHash, randomBytes } from "node:crypto";

type TokenRecord = {
  id: string;
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
};

type TokenDependencies = {
  insertToken: (args: {
    ownerId: string;
    label: string;
    tokenHash: string;
  }) => Promise<{ id: string }>;
  listTokens: (ownerId: string) => Promise<TokenRecord[]>;
  revokeToken: (args: { ownerId: string; id: string }) => Promise<void>;
  writeAudit: (entry: {
    ownerId: string;
    authMethod: "session";
    action: string;
    resourceType: string;
    resourceId: string;
  }) => Promise<void>;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createTokenService(deps: TokenDependencies) {
  return {
    async create(input: { ownerId: string; label: string }) {
      const plaintextToken = `nomi_${randomBytes(24).toString("hex")}`;
      const created = await deps.insertToken({
        ownerId: input.ownerId,
        label: input.label,
        tokenHash: hashToken(plaintextToken)
      });

      await deps.writeAudit({
        ownerId: input.ownerId,
        authMethod: "session",
        action: "token.created",
        resourceType: "api_token",
        resourceId: created.id
      });

      return {
        id: created.id,
        plaintextToken
      };
    },
    list(ownerId: string) {
      return deps.listTokens(ownerId);
    },
    async revoke(input: { ownerId: string; id: string }) {
      await deps.revokeToken(input);

      await deps.writeAudit({
        ownerId: input.ownerId,
        authMethod: "session",
        action: "token.revoked",
        resourceType: "api_token",
        resourceId: input.id
      });
    }
  };
}

export { hashToken };
