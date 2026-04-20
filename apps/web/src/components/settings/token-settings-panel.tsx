"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

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
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">API Tokens</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Create personal tokens for future iOS, macOS, and iMessage clients.
      </p>

      <section className="mt-6 rounded-3xl border border-border/80 bg-card/60 p-5 shadow-sm">
        <div className="border-b border-border/70 pb-4">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Create token
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Personal access
          </h2>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Label</span>
            <input
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="MacBook dev client"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              disabled={isSubmitting}
            />
          </label>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create token"}
          </Button>
        </form>

        {createdToken ? (
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">
                  Token created for {createdToken.label}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Copy it now. This plaintext value will not be shown again.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCreatedToken(null)}
              >
                Dismiss
              </Button>
            </div>
            <code className="mt-3 block overflow-x-auto rounded-xl border border-border/70 bg-background px-3 py-3 text-sm">
              {createdToken.plaintextToken}
            </code>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-3xl border border-border/80 bg-card/60 p-5 shadow-sm">
        <div className="border-b border-border/70 pb-4">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Current tokens
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Active credentials
          </h2>
        </div>

        {errorMessage ? (
          <p
            className="mt-4 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            role="status"
            aria-live="polite"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-4 space-y-3">
          {tokens.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
              No active tokens yet.
            </div>
          ) : (
            tokens.map((token) => (
              <article
                key={token.id}
                className="rounded-2xl border border-border/80 bg-background/80 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold">{token.label}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Created {dateFormatter.format(new Date(token.createdAt))}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
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
                    {revokingId === token.id ? "Revoking..." : "Revoke"}
                  </Button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
