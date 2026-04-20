# Nomi Web

Private single-user Next.js app for Nomi. The web app handles owner-only sign-in, Gemini-backed chat, conversation and memory persistence in Neon via Drizzle, token-based API access, and audit logging.

## Stack

- Next.js 16 App Router
- NextAuth v5 with Google sign-in
- Neon Postgres + Drizzle ORM
- Gemini via `@ai-sdk/google`
- Vitest + ESLint + TypeScript

## Required Environment Variables

Set these in `apps/web/.env.local` for local development:

```bash
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
DATABASE_URL=
GOOGLE_GENERATIVE_AI_API_KEY=
GEMINI_MODEL=gemini-3-flash-preview
OWNER_EMAIL=
```

Notes:

- `OWNER_EMAIL` must match the Google account allowed to sign in.
- `DATABASE_URL` should point at your Neon Postgres database.
- `GEMINI_MODEL` is optional in practice because the app has a default, but setting it explicitly keeps local and Vercel config aligned.

## Install And Run

From the repo root:

```bash
pnpm install
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

If you prefer running directly from the app directory:

```bash
pnpm --dir apps/web dev
```

## Quality Gate

Run these from the repo root:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

App-local equivalents:

```bash
pnpm --dir apps/web test
pnpm --dir apps/web lint
pnpm --dir apps/web exec tsc --noEmit
pnpm --dir apps/web build
```

## Database

Schema files live in `apps/web/src/db/schema`.

Useful commands:

```bash
pnpm --dir apps/web exec drizzle-kit generate
```

This repo already includes the generated SQL in `apps/web/drizzle/`. Apply it to Neon using your normal Postgres migration flow before running against a fresh database.

## Vercel Deploy

1. Create a Vercel project rooted at `apps/web` or link the monorepo and set the root directory to `apps/web`.
2. Add all environment variables from the list above to the Vercel project.
3. Ensure `DATABASE_URL` points at your production Neon database.
4. Configure the Google OAuth app to allow the Vercel deployment URL as an authorized redirect origin/URL for NextAuth.
5. Deploy with Vercel.

With the Vercel CLI:

```bash
pnpm dlx vercel --cwd apps/web
```

Before promoting a production deploy, verify:

- the owner can sign in with Google
- `/api/chat` can reach Gemini
- Neon reads and writes succeed for conversations, messages, memory, tokens, and audit logs
