import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type SignInAction = (() => Promise<void>) | ((formData: FormData) => Promise<void>);

type SignInScreenProps = {
  isMagicLinkEnabled: boolean;
  onEmailSignIn: SignInAction;
  onGoogleSignIn: SignInAction;
};

export function SignInScreen({
  isMagicLinkEnabled,
  onEmailSignIn,
  onGoogleSignIn,
}: SignInScreenProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_40%),radial-gradient(circle_at_100%_0%,color-mix(in_oklab,var(--accent)_20%,transparent),transparent_30%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_96%,white),var(--background))] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-5xl items-center">
        <section className="grid w-full gap-4 rounded-3xl border border-border/70 bg-background/82 p-4 md:grid-cols-[1.1fr_minmax(0,0.9fr)] md:p-6">
          <div className="rounded-2xl border border-border/70 bg-background/78 p-6 md:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Owner workspace
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Welcome to Nomi</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              A private assistant workspace for protected chat, memory, and token
              management.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-muted/25 px-3 py-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Chat
                </p>
                <p className="mt-2 text-sm font-medium">Persistent threads</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/25 px-3 py-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Memory
                </p>
                <p className="mt-2 text-sm font-medium">Pinned context</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/25 px-3 py-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Tokens
                </p>
                <p className="mt-2 text-sm font-medium">Managed access</p>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="mx-auto w-full max-w-sm rounded-2xl border border-border/70 bg-background/82 p-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight">Sign in</h2>
                <p className="text-sm text-muted-foreground">
                  Use the owner email for access.
                </p>
              </div>

              <form action={onEmailSignIn} className="mt-6 flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="owner@example.com"
                    autoComplete="email"
                    disabled={!isMagicLinkEnabled}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!isMagicLinkEnabled}>
                  Send magic link
                </Button>
                {!isMagicLinkEnabled ? (
                  <p className="text-xs text-muted-foreground">
                    Magic-link email is not configured for this environment yet.
                  </p>
                ) : null}
              </form>

              <div className="relative my-5">
                <Separator />
                <span className="absolute inset-x-0 top-1/2 mx-auto -translate-y-1/2 bg-background px-3 text-center text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Or continue with
                </span>
              </div>

              <form action={onGoogleSignIn}>
                <Button type="submit" variant="outline" className="w-full">
                  Continue with Google
                </Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
