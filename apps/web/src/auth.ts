import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { readEnv } from "@/env";
import { accounts, sessions, users, verificationTokens } from "@/db/schema/auth";
import { isOwnerEmail } from "@/server/auth/is-owner-email";

const authEnv = readEnv(process.env);

const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  } as const as never),
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

const nextAuth = NextAuth(authOptions);

export const { handlers, auth, signIn, signOut } = Object.assign(nextAuth, {
  handlers: {
    GET: nextAuth,
    POST: nextAuth,
  },
  auth: () => getServerSession(authOptions),
  signIn: async (provider: "google", options?: { redirectTo?: string }) => {
    const callbackUrl = options?.redirectTo ?? "/";
    redirect(`/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  },
  signOut: async (options?: { redirectTo?: string }) => {
    const callbackUrl = options?.redirectTo ?? "/";
    redirect(`/api/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  },
});
