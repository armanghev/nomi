import { signIn } from "@/auth";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/chat" });
        }}
        className="w-full max-w-sm rounded-2xl border p-8 shadow-sm"
      >
        <h1 className="text-2xl font-semibold">Nomi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with the allowlisted Google account.
        </p>
        <button className="mt-6 w-full rounded-md bg-foreground px-4 py-2 text-background">
          Continue with Google
        </button>
      </form>
    </main>
  );
}
