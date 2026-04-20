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
};

export async function resolveRequestAuth(
  request: Request,
  deps: ResolveRequestAuthDependencies = {}
): Promise<RequestAuth | null> {
  const header = request.headers.get("authorization");

  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();

    if (token.length > 0) {
      return {
        ownerId: "owner_from_token_lookup",
        authMethod: "token",
        tokenHash: hashToken(token)
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
