import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { authConfig } from "@/auth.config";
import { accounts, sessions, users, verificationTokens } from "@/db/schema/auth";

const authSchema = {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
} as const;

const database = process.env.DATABASE_URL
  ? drizzle(neon(process.env.DATABASE_URL), {
      schema: {
        ...authSchema,
      },
    })
  : null;

const adapter = database
  ? DrizzleAdapter(database, authSchema as never)
  : undefined;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
});
