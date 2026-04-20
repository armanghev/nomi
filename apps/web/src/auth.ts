import NextAuth, { getServerSession, type NextAuthOptions, type Session } from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq, gt } from "drizzle-orm";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { readEnv } from "@/env";
import { accounts, sessions, users, verificationTokens } from "@/db/schema/auth";
import { isOwnerEmail } from "@/server/auth/is-owner-email";

const authEnv = readEnv(process.env);
const authSchema = {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
} as const;

const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, authSchema as unknown as never),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: authEnv.AUTH_GOOGLE_ID,
      clientSecret: authEnv.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      return isOwnerEmail(profile?.email, authEnv.OWNER_EMAIL);
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
};

const nextAuthHandler = NextAuth(authOptions);

type MiddlewareAuthRequest = NextRequest & {
  auth: Session | null;
};

type MiddlewareCallback = (
  request: MiddlewareAuthRequest,
) => Response | NextResponse | void | Promise<Response | NextResponse | void>;

async function getSessionFromRequest(request: NextRequest): Promise<Session | null> {
  const sessionToken =
    request.cookies.get("__Secure-next-auth.session-token")?.value ??
    request.cookies.get("next-auth.session-token")?.value;

  if (!sessionToken) {
    return null;
  }

  const [row] = await db
    .select({
      sessionExpires: sessions.expires,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      userImage: users.image,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.sessionToken, sessionToken), gt(sessions.expires, new Date())))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    user: {
      id: row.userId,
      name: row.userName,
      email: row.userEmail,
      image: row.userImage,
    },
    expires: row.sessionExpires.toISOString(),
  };
}

export function auth(): Promise<Session | null>;
export function auth(callback: MiddlewareCallback): (request: NextRequest) => Promise<Response | NextResponse>;
export function auth(callback?: MiddlewareCallback) {
  if (!callback) {
    return getServerSession(authOptions);
  }

  return async (request: NextRequest) => {
    const session = await getSessionFromRequest(request);
    const authedRequest = Object.assign(request, { auth: session }) as MiddlewareAuthRequest;
    const response = await callback(authedRequest);

    return response ?? NextResponse.next();
  };
}

export const handlers = {
  GET: nextAuthHandler,
  POST: nextAuthHandler,
};

export async function signIn(
  provider: "google",
  options?: { redirectTo?: string },
): Promise<never> {
  const callbackUrl = options?.redirectTo ?? "/";
  redirect(`/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`);
}

export async function signOut(options?: { redirectTo?: string }): Promise<never> {
  const callbackUrl = options?.redirectTo ?? "/";
  redirect(`/api/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}`);
}
