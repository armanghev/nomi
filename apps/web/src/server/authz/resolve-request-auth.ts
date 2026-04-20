import { hashToken } from "@/server/tokens/token-service";

type RequestAuth =
  | {
      ownerId: string;
      authMethod: "session";
    }
  | {
      ownerId: string;
      authMethod: "token";
      tokenHash: string;
    };

type ResolveRequestAuthDependencies = {
  getSession?: () => Promise<{ user?: { id?: string } } | null>;
  lookupTokenOwnerId?: (tokenHash: string) => Promise<string | null>;
};

export async function resolveRequestAuth(
  request: Request,
  deps: ResolveRequestAuthDependencies = {}
): Promise<RequestAuth | null> {
  const header = request.headers.get("authorization");

  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();

    if (token.length > 0) {
      const tokenHash = hashToken(token);
      const ownerId = await deps.lookupTokenOwnerId?.(tokenHash);

      if (!ownerId) {
        return null;
      }

      return {
        ownerId,
        authMethod: "token",
        tokenHash
      };
    }
  }

  const getSession =
    deps.getSession ??
    (async () => {
      const { auth } = await import("@/auth");
      return auth();
    });

  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  return {
    ownerId: session.user.id,
    authMethod: "session"
  };
}
