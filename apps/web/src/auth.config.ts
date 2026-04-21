import NextAuth, { type NextAuthConfig } from "next-auth";
import { isOwnerEmail } from "@/server/auth/is-owner-email";
import { buildEdgeAuthProviders } from "@/server/auth/auth-provider-config";

const ownerEmail = process.env.OWNER_EMAIL ?? "";

export const authConfig = {
  providers: buildEdgeAuthProviders({
    googleClientId: process.env.AUTH_GOOGLE_ID ?? "",
    googleClientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
  }),
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "nodemailer") {
        return isOwnerEmail(user.email, ownerEmail);
      }

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
