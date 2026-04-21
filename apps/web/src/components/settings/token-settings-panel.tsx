"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircleIcon, ShieldCheckIcon } from "lucide-react";

type ApiToken = {
  id: string;
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
};

type CreatedToken = {
  label: string;
  plaintextToken: string;
};

type TokenSettingsPanelProps = {
  initialTokens: ApiToken[];
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function TokenSettingsPanel({
  initialTokens,
}: TokenSettingsPanelProps) {
  const [tokens, setTokens] = useState<ApiToken[]>(initialTokens);
  const [label, setLabel] = useState("");
  const [createdToken, setCreatedToken] = useState<CreatedToken | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedLabel = label.trim();

    if (!trimmedLabel) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: trimmedLabel }),
      });

      if (!response.ok) {
        throw new Error("Failed to create token");
      }

      const payload = (await response.json()) as {
        id: string;
        label: string;
        plaintextToken: string;
      };

      setCreatedToken({
        label: payload.label,
        plaintextToken: payload.plaintextToken,
      });
      setLabel("");
      const refreshedTokensResponse = await fetch("/api/tokens", {
        cache: "no-store",
      });

      if (!refreshedTokensResponse.ok) {
        throw new Error("Failed to refresh tokens");
      }

      const refreshedTokens =
        (await refreshedTokensResponse.json()) as ApiToken[];
      setTokens(refreshedTokens);
    } catch {
      setErrorMessage("Couldn't create that token.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRevoke(id: string, tokenLabel: string) {
    const shouldRevoke = window.confirm(
      `Revoke "${tokenLabel}"? Any client using it will lose access immediately.`
    );

    if (!shouldRevoke) {
      return;
    }

    setRevokingId(id);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/tokens/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to revoke token");
      }

      setTokens((current) => current.filter((token) => token.id !== id));
    } catch {
      setErrorMessage("Couldn't revoke that token.");
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <main className="space-y-5">
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Settings
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">API Tokens</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Create personal tokens for clients and background jobs. Tokens are shown
          once and can be revoked immediately.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border/75 bg-background/72 p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium">
            <ShieldCheckIcon className="size-4 text-muted-foreground" />
            Create token
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm">Label</span>
              <Input
                placeholder="MacBook dev client"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                disabled={isSubmitting}
              />
            </label>

            <Button type="submit" disabled={isSubmitting || !label.trim()}>
              {isSubmitting ? (
                <>
                  <LoaderCircleIcon className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create token"
              )}
            </Button>
          </form>

          {createdToken ? (
            <div className="mt-4 rounded-xl border border-foreground/15 bg-foreground/5 p-3">
              <p className="text-sm font-medium">Token created for {createdToken.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Copy it now. This value will not be shown again.
              </p>
              <code className="mt-3 block overflow-x-auto rounded-lg border border-border/70 bg-background px-3 py-2 text-xs">
                {createdToken.plaintextToken}
              </code>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-border/75 bg-background/72 p-4">
          <div className="mb-4 text-sm font-medium">Active credentials</div>

          {errorMessage ? (
            <p
              className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="status"
              aria-live="polite"
            >
              {errorMessage}
            </p>
          ) : null}

          <div className="space-y-2">
            {tokens.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
                No active tokens yet.
              </div>
            ) : (
              tokens.map((token) => (
                <article
                  key={token.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-border/70 bg-background/80 px-3 py-3"
                >
                  <div>
                    <h3 className="text-sm font-medium">{token.label}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Created {dateFormatter.format(new Date(token.createdAt))}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {token.lastUsedAt
                        ? `Last used ${dateFormatter.format(
                            new Date(token.lastUsedAt)
                          )}`
                        : "Never used"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={revokingId === token.id}
                    onClick={() => handleRevoke(token.id, token.label)}
                  >
                    {revokingId === token.id ? (
                      <>
                        <LoaderCircleIcon className="size-4 animate-spin" />
                        Revoking...
                      </>
                    ) : (
                      "Revoke"
                    )}
                  </Button>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
