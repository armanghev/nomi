import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { isOwnerEmail } from "@/server/auth/is-owner-email";

const ownerEmail = process.env.OWNER_EMAIL ?? "";

export const authConfig = {
  providers: [Google],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ profile }) {
      const googleProfile = profile as
        | {
            email?: string;
            email_verified?: boolean;
          }
        | undefined;

      return (
        googleProfile?.email_verified === true &&
        isOwnerEmail(googleProfile?.email, ownerEmail)
      );
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
} satisfies NextAuthConfig;

export const { auth } = NextAuth(authConfig);
