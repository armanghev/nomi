import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { readEnv } from "@/env";
import { accounts, sessions, users, verificationTokens } from "@/db/schema/auth";
import { isOwnerEmail } from "@/server/auth/is-owner-email";

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const authEnv = readEnv(process.env);
  const { db } = await import("@/db");

  return {
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
      async authorized({ auth }) {
        return !!auth?.user;
      },
    },
    pages: {
      signIn: "/sign-in",
    },
  };
});
