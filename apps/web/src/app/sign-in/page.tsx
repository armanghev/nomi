import { signIn } from "@/auth";
import { SignInScreen } from "@/components/auth/sign-in-screen";
import { isMagicLinkConfigured } from "@/server/auth/auth-provider-config";

export default function SignInPage() {
  const magicLinkEnabled = isMagicLinkConfigured({
    emailServer: process.env.EMAIL_SERVER,
    emailFrom: process.env.EMAIL_FROM,
  });

  return (
    <SignInScreen
      isMagicLinkEnabled={magicLinkEnabled}
      onEmailSignIn={async (formData) => {
        "use server";

        const email = formData.get("email");
        if (typeof email !== "string" || !email.trim()) {
          return;
        }

        await signIn("nodemailer", {
          email: email.trim(),
          redirectTo: "/station/dashboard",
        });
      }}
      onGoogleSignIn={async () => {
        "use server";
        await signIn("google", { redirectTo: "/station/dashboard" });
      }}
    />
  );
}
