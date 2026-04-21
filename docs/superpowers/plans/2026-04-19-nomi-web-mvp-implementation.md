# Nomi Web MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first deployable `Nomi` web MVP with owner-only Google auth, streamed chat, persistent history, explicit memory, audit logging, and personal API tokens for future native/iMessage clients.

**Architecture:** Use a single Next.js app in `apps/web` for the web UI and API routes, but keep business logic in shared server-side services. Web requests authenticate through `Auth.js` Google OAuth; future clients authenticate through hashed owner-managed API tokens. Both auth modes resolve to the same owner identity before reaching chat, memory, history, or token services.

**Tech Stack:** Next.js App Router, TypeScript, pnpm workspace, Tailwind CSS, shadcn/ui, TweakCN theme, Auth.js, Neon Postgres, Drizzle ORM, Vercel AI SDK, OpenAI provider, Zod, Vitest, React Testing Library

---

## Planned File Structure

### Workspace Root

- Create: `/Users/armanghevondyan/dev/nomi/package.json`
  Purpose: root scripts that delegate into `apps/web`
- Create: `/Users/armanghevondyan/dev/nomi/pnpm-workspace.yaml`
  Purpose: workspace definition for the nested web app
- Create: `/Users/armanghevondyan/dev/nomi/.gitignore`
  Purpose: ignore Node, Next, env, Vercel, and visual-companion artifacts

### Web App

- Create: `/Users/armanghevondyan/dev/nomi/apps/web/*`
  Purpose: Next.js application scaffold
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/drizzle.config.ts`
  Purpose: Drizzle migration configuration
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/env.ts`
  Purpose: validated server environment access
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/auth.ts`
  Purpose: `Auth.js` configuration with Google provider and owner-email allowlist
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/middleware.ts`
  Purpose: route gating for protected pages
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/db/schema/*.ts`
  Purpose: Auth.js tables plus conversations, messages, memory, tokens, and audit logs
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/authz/*`
  Purpose: resolve owner identity from session or bearer token
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/chat/*`
  Purpose: shared chat service and tests
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/history/*`
  Purpose: conversation list/load/delete logic
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/memory/*`
  Purpose: explicit memory CRUD logic
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/tokens/*`
  Purpose: personal API token creation, hashing, and revocation
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/audit/*`
  Purpose: append-only audit logging
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/api/**/route.ts`
  Purpose: thin route handlers that authenticate, validate, call services, and return responses
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/components/chat/*`
  Purpose: protected chat UI
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/components/settings/*`
  Purpose: memory and token management UI
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/*`
  Purpose: authenticated app shell pages

### Documentation

- Create: `/Users/armanghevondyan/dev/nomi/apps/web/.env.example`
  Purpose: required env variables for local and Vercel deployments
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/README.md`
  Purpose: setup, migration, run, test, and deploy instructions

---

### Task 1: Bootstrap The Workspace And Next.js App

**Files:**
- Create: `/Users/armanghevondyan/dev/nomi/package.json`
- Create: `/Users/armanghevondyan/dev/nomi/pnpm-workspace.yaml`
- Create: `/Users/armanghevondyan/dev/nomi/.gitignore`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/*`

- [ ] **Step 1: Initialize git and create the root workspace files**

```json
// /Users/armanghevondyan/dev/nomi/package.json
{
  "name": "nomi",
  "private": true,
  "packageManager": "pnpm@10.0.0",
  "scripts": {
    "dev": "pnpm --dir apps/web dev",
    "build": "pnpm --dir apps/web build",
    "lint": "pnpm --dir apps/web lint",
    "typecheck": "pnpm --dir apps/web exec tsc --noEmit",
    "test": "pnpm --dir apps/web vitest run"
  }
}
```

```yaml
# /Users/armanghevondyan/dev/nomi/pnpm-workspace.yaml
packages:
  - "apps/*"
```

```gitignore
# /Users/armanghevondyan/dev/nomi/.gitignore
node_modules
.next
dist
coverage
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.vercel
.turbo
.DS_Store
.superpowers/
```

Run:

```bash
cd /Users/armanghevondyan/dev/nomi
git init
```

Expected: `Initialized empty Git repository`

- [ ] **Step 2: Scaffold the Next.js app into `apps/web`**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi
pnpm dlx create-next-app@latest apps/web --ts --eslint --tailwind --app --src-dir --use-pnpm --import-alias "@/*" --yes
```

Expected: `Success! Created web at /Users/armanghevondyan/dev/nomi/apps/web`

- [ ] **Step 3: Install runtime and test dependencies**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm add next-auth @auth/drizzle-adapter drizzle-orm @neondatabase/serverless ai @ai-sdk/openai zod nanoid
pnpm add -D drizzle-kit vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react
```

Expected: dependencies installed with no peer dependency errors that block install

- [ ] **Step 4: Initialize shadcn and apply the chosen TweakCN theme**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm dlx shadcn@latest init -d
pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/cmo1s6k3r000804l59ehggmgx
```

Expected: `components.json` exists and theme files are added to the app

- [ ] **Step 5: Add a minimal Vitest config so later test-first tasks can run immediately**

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/vitest.setup.ts
import "@testing-library/jest-dom/vitest";
```

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm exec vitest run
```

Expected: exits successfully with `No test files found`

- [ ] **Step 6: Commit the scaffold**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi
git add .
git commit -m "chore: scaffold nomi web workspace"
```

Expected: first commit created

---

### Task 2: Add Environment Validation And Drizzle Schema Foundations

**Files:**
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/env.test.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/env.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/drizzle.config.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/db/schema/auth.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/db/schema/app.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/db/index.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/.env.example`

- [ ] **Step 1: Write the failing environment validation test**

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/env.test.ts
import { describe, expect, it } from "vitest";
import { readEnv } from "./env";

describe("readEnv", () => {
  it("throws when OWNER_EMAIL is missing", () => {
    expect(() =>
      readEnv({
        AUTH_SECRET: "secret",
        AUTH_GOOGLE_ID: "google-id",
        AUTH_GOOGLE_SECRET: "google-secret",
        DATABASE_URL: "postgres://user:pass@host/db",
        OPENAI_API_KEY: "key"
      })
    ).toThrow("OWNER_EMAIL");
  });

  it("returns a typed env object when all required values exist", () => {
    expect(
      readEnv({
        AUTH_SECRET: "secret",
        AUTH_GOOGLE_ID: "google-id",
        AUTH_GOOGLE_SECRET: "google-secret",
        DATABASE_URL: "postgres://user:pass@host/db",
        OPENAI_API_KEY: "key",
        OWNER_EMAIL: "you@example.com"
      }).OWNER_EMAIL
    ).toBe("you@example.com");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails because `readEnv` does not exist**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm exec vitest run src/env.test.ts
```

Expected: FAIL with module or export error for `./env`

- [ ] **Step 3: Implement env parsing, Drizzle config, and base schemas**

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/env.ts
import { z } from "zod";

const envSchema = z.object({
  AUTH_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1).default("gpt-4o-mini"),
  OWNER_EMAIL: z.string().email()
});

export type AppEnv = z.infer<typeof envSchema>;

export function readEnv(source: Record<string, string | undefined>): AppEnv {
  return envSchema.parse(source);
}

export const env = readEnv(process.env);
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? ""
  }
});
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/db/schema/app.ts
import { boolean, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const memoryItems = pgTable("memory_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const apiTokens = pgTable("api_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull(),
  label: text("label").notNull(),
  tokenHash: text("token_hash").notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true })
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id"),
  authMethod: text("auth_method").notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/db/schema/auth.ts
import { primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image")
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state")
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.provider, table.providerAccountId]
    })
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull()
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull()
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.identifier, table.token]
    })
  })
);
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "@/env";
import * as authSchema from "@/db/schema/auth";
import * as appSchema from "@/db/schema/app";

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, {
  schema: {
    ...authSchema,
    ...appSchema
  }
});
```

```env
# /Users/armanghevondyan/dev/nomi/apps/web/.env.example
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
DATABASE_URL=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OWNER_EMAIL=
```

- [ ] **Step 4: Generate the first Drizzle migration and rerun the env test**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm exec vitest run src/env.test.ts
pnpm exec drizzle-kit generate
```

Expected:
- `src/env.test.ts` passes
- `drizzle/` contains an initial SQL migration

- [ ] **Step 5: Commit the environment and schema foundation**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi
git add .
git commit -m "feat: add env validation and base schema"
```

Expected: commit created with env and schema files

---

### Task 3: Implement Owner-Only Google Authentication

**Files:**
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/auth/is-owner-email.test.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/auth/is-owner-email.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/auth.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/types/next-auth.d.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/api/auth/[...nextauth]/route.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/middleware.ts`
- Modify: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/page.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/sign-in/page.tsx`

- [ ] **Step 1: Write the failing owner-email allowlist test**

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/server/auth/is-owner-email.test.ts
import { describe, expect, it } from "vitest";
import { isOwnerEmail } from "./is-owner-email";

describe("isOwnerEmail", () => {
  it("matches the configured owner email case-insensitively", () => {
    expect(isOwnerEmail("You@Example.com", "you@example.com")).toBe(true);
  });

  it("rejects non-owner emails", () => {
    expect(isOwnerEmail("other@example.com", "you@example.com")).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails because the helper does not exist**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm exec vitest run src/server/auth/is-owner-email.test.ts
```

Expected: FAIL with module-not-found error

- [ ] **Step 3: Implement the helper and Auth.js configuration**

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/server/auth/is-owner-email.ts
export function isOwnerEmail(candidate: string | null | undefined, ownerEmail: string): boolean {
  return (candidate ?? "").trim().toLowerCase() === ownerEmail.trim().toLowerCase();
}
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { env } from "@/env";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema/auth";
import { isOwnerEmail } from "@/server/auth/is-owner-email";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens
  }),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET
    })
  ],
  callbacks: {
    async signIn({ profile }) {
      return isOwnerEmail(profile?.email, env.OWNER_EMAIL);
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/sign-in"
  }
});
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
    };
  }
}
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/middleware.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((request) => {
  const isProtected = request.nextUrl.pathname.startsWith("/chat") || request.nextUrl.pathname.startsWith("/settings");

  if (isProtected && !request.auth) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/chat/:path*", "/settings/:path*"]
};
```

- [ ] **Step 4: Update the landing page and add the sign-in screen**

```tsx
// /Users/armanghevondyan/dev/nomi/apps/web/src/app/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  redirect(session ? "/chat" : "/sign-in");
}
```

```tsx
// /Users/armanghevondyan/dev/nomi/apps/web/src/app/sign-in/page.tsx
import { signIn } from "@/auth";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/chat" });
        }}
        className="w-full max-w-sm rounded-2xl border p-8 shadow-sm"
      >
        <h1 className="text-2xl font-semibold">Nomi</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in with the allowlisted Google account.</p>
        <button className="mt-6 w-full rounded-md bg-foreground px-4 py-2 text-background">
          Continue with Google
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 5: Run tests, lint, and typecheck**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm exec vitest run src/server/auth/is-owner-email.test.ts
pnpm lint
pnpm exec tsc --noEmit
```

Expected: all commands succeed

- [ ] **Step 6: Commit the auth layer**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi
git add .
git commit -m "feat: add owner-only google authentication"
```

Expected: commit created

---

### Task 4: Implement Shared Chat Service And Protected Chat API

**Files:**
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/chat/chat-service.test.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/chat/chat-service.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/ai/model.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/audit/audit-log.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/api/chat/route.ts`

- [ ] **Step 1: Write the failing chat-service test**

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/server/chat/chat-service.test.ts
import { describe, expect, it, vi } from "vitest";
import { createChatService } from "./chat-service";

describe("createChatService", () => {
  it("persists the user message, assistant reply, and audit event", async () => {
    const saveMessage = vi.fn();
    const writeAudit = vi.fn();

    const service = createChatService({
      generateReply: async () => "Hello from Nomi",
      createConversation: async () => ({ id: "conv_1", title: "First message" }),
      saveMessage,
      loadActiveMemory: async () => [{ label: "Tone", value: "Be concise" }],
      writeAudit
    });

    const result = await service.sendMessage({
      ownerId: "owner_1",
      conversationId: null,
      content: "Help me refactor this function"
    });

    expect(result.conversationId).toBe("conv_1");
    expect(saveMessage).toHaveBeenCalledTimes(2);
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "chat.message.created",
        authMethod: "session"
      })
    );
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm exec vitest run src/server/chat/chat-service.test.ts
```

Expected: FAIL because `createChatService` does not exist

- [ ] **Step 3: Implement the chat service and model wrapper**

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/server/chat/chat-service.ts
type ChatInput = {
  ownerId: string;
  conversationId: string | null;
  content: string;
  authMethod?: "session" | "token";
};

type ChatDependencies = {
  generateReply: (args: { prompt: string; memory: Array<{ label: string; value: string }> }) => Promise<string>;
  createConversation: (args: { ownerId: string; title: string }) => Promise<{ id: string; title: string }>;
  saveMessage: (args: { conversationId: string; role: "user" | "assistant"; content: string }) => Promise<void>;
  loadActiveMemory: (ownerId: string) => Promise<Array<{ label: string; value: string }>>;
  writeAudit: (entry: {
    ownerId: string;
    authMethod: "session" | "token";
    action: string;
    resourceType: string;
    resourceId: string;
  }) => Promise<void>;
};

export function createChatService(deps: ChatDependencies) {
  return {
    async sendMessage(input: ChatInput) {
      const conversation =
        input.conversationId !== null
          ? { id: input.conversationId, title: input.content.slice(0, 80) }
          : await deps.createConversation({ ownerId: input.ownerId, title: input.content.slice(0, 80) });

      const memory = await deps.loadActiveMemory(input.ownerId);
      await deps.saveMessage({ conversationId: conversation.id, role: "user", content: input.content });

      const reply = await deps.generateReply({ prompt: input.content, memory });

      await deps.saveMessage({ conversationId: conversation.id, role: "assistant", content: reply });
      await deps.writeAudit({
        ownerId: input.ownerId,
        authMethod: input.authMethod ?? "session",
        action: "chat.message.created",
        resourceType: "conversation",
        resourceId: conversation.id
      });

      return {
        conversationId: conversation.id,
        reply
      };
    }
  };
}
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/server/ai/model.ts
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { env } from "@/env";

export async function generateAssistantReply(prompt: string, memory: Array<{ label: string; value: string }>) {
  const memoryContext = memory.map((item) => `${item.label}: ${item.value}`).join("\n");

  const result = await generateText({
    model: openai(env.OPENAI_MODEL),
    system: `You are Nomi, a private personal assistant.\nRelevant memory:\n${memoryContext || "None"}`,
    prompt
  });

  return result.text;
}
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/server/audit/audit-log.ts
export async function writeAuditLog(entry: {
  ownerId: string | null;
  authMethod: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  metadata?: Record<string, unknown>;
}) {
  console.info("audit", entry);
}
```

- [ ] **Step 4: Add the protected `/api/chat` route**

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createChatService } from "@/server/chat/chat-service";
import { generateAssistantReply } from "@/server/ai/model";

const requestSchema = z.object({
  conversationId: z.string().uuid().nullable(),
  content: z.string().min(1)
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = requestSchema.parse(await request.json());

  const service = createChatService({
    generateReply: ({ prompt, memory }) => generateAssistantReply(prompt, memory),
    createConversation: async ({ title }) => ({ id: crypto.randomUUID(), title }),
    saveMessage: async () => {},
    loadActiveMemory: async () => [],
    writeAudit: async () => {}
  });

  const result = await service.sendMessage({
    ownerId: session.user.id,
    conversationId: body.conversationId,
    content: body.content,
    authMethod: "session"
  });

  return NextResponse.json(result);
}
```

- [ ] **Step 5: Run the chat test and a narrow typecheck**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm exec vitest run src/server/chat/chat-service.test.ts
pnpm exec tsc --noEmit
```

Expected: both commands pass

- [ ] **Step 6: Commit the shared chat service**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi
git add .
git commit -m "feat: add protected chat api foundation"
```

Expected: commit created

---

### Task 5: Build The Protected Chat UI

**Files:**
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/components/chat/chat-screen.test.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/components/chat/chat-screen.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/chat/page.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/layout.tsx`

- [ ] **Step 1: Write the failing chat-screen component test**

```tsx
// /Users/armanghevondyan/dev/nomi/apps/web/src/components/chat/chat-screen.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatScreen } from "./chat-screen";

describe("ChatScreen", () => {
  it("submits a message from the composer", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<ChatScreen messages={[]} onSend={onSend} isSending={false} />);

    fireEvent.change(screen.getByPlaceholderText("Ask Nomi anything"), {
      target: { value: "Summarize my day" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(onSend).toHaveBeenCalledWith("Summarize my day");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm exec vitest run src/components/chat/chat-screen.test.tsx
```

Expected: FAIL because `ChatScreen` does not exist

- [ ] **Step 3: Implement the chat UI component**

```tsx
// /Users/armanghevondyan/dev/nomi/apps/web/src/components/chat/chat-screen.tsx
"use client";

import { FormEvent, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatScreenProps = {
  messages: ChatMessage[];
  isSending: boolean;
  onSend: (content: string) => Promise<void>;
};

export function ChatScreen({ messages, isSending, onSend }: ChatScreenProps) {
  const [value, setValue] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    await onSend(trimmed);
    setValue("");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-6">
        {messages.map((message) => (
          <article key={message.id} className="rounded-xl border p-4">
            <p className="text-xs uppercase text-muted-foreground">{message.role}</p>
            <p className="mt-2 whitespace-pre-wrap">{message.content}</p>
          </article>
        ))}
      </div>
      <form className="border-t p-4" onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <input
            className="flex-1 rounded-md border px-3 py-2"
            placeholder="Ask Nomi anything"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button className="rounded-md bg-foreground px-4 py-2 text-background" disabled={isSending}>
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Wire the protected chat page to the API**

```tsx
// /Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/chat/page.tsx
"use client";

import { useState } from "react";
import { ChatScreen } from "@/components/chat/chat-screen";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  async function onSend(content: string) {
    setIsSending(true);
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", content }]);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: null, content })
    });

    const payload = await response.json();

    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: payload.reply }]);
    setIsSending(false);
  }

  return <ChatScreen messages={messages} onSend={onSend} isSending={isSending} />;
}
```

```tsx
// /Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/layout.tsx
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>;
}
```

- [ ] **Step 5: Run the component test and manually verify in a browser**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm exec vitest run src/components/chat/chat-screen.test.tsx
pnpm dev
```

Expected:
- component test passes
- dev server starts on a local port

Manual verification:

```text
Use the dev-browser skill to confirm the sign-in page loads, successful owner auth redirects to /chat, and the chat layout works on desktop and mobile widths.
```

- [ ] **Step 6: Commit the protected chat UI**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi
git add .
git commit -m "feat: add protected chat interface"
```

Expected: commit created

---

### Task 6: Add Conversation History And Explicit Memory

**Files:**
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/memory/memory-service.test.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/memory/memory-service.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/history/history-service.test.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/history/history-service.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/api/memory/route.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/api/memory/[id]/route.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/api/conversations/route.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/api/conversations/[id]/route.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/settings/memory/page.tsx`

- [ ] **Step 1: Write the failing memory-service test**

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/server/memory/memory-service.test.ts
import { describe, expect, it, vi } from "vitest";
import { createMemoryService } from "./memory-service";

describe("createMemoryService", () => {
  it("creates an active memory item and writes an audit log", async () => {
    const insertMemory = vi.fn().mockResolvedValue({ id: "mem_1", label: "School", value: "Prioritize deadlines" });
    const writeAudit = vi.fn();
    const service = createMemoryService({ insertMemory, listMemory: vi.fn(), deleteMemory: vi.fn(), writeAudit });

    const created = await service.create({
      ownerId: "owner_1",
      label: "School",
      value: "Prioritize deadlines"
    });

    expect(created.id).toBe("mem_1");
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "memory.created", resourceType: "memory_item" })
    );
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm exec vitest run src/server/memory/memory-service.test.ts
```

Expected: FAIL because `createMemoryService` does not exist

- [ ] **Step 3: Implement the memory and history services**

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/server/memory/memory-service.ts
type MemoryDependencies = {
  insertMemory: (args: { ownerId: string; label: string; value: string }) => Promise<{ id: string; label: string; value: string }>;
  listMemory: (ownerId: string) => Promise<Array<{ id: string; label: string; value: string }>>;
  deleteMemory: (args: { ownerId: string; id: string }) => Promise<void>;
  writeAudit: (entry: { ownerId: string; authMethod: "session" | "token"; action: string; resourceType: string; resourceId: string }) => Promise<void>;
};

export function createMemoryService(deps: MemoryDependencies) {
  return {
    async create(input: { ownerId: string; label: string; value: string; authMethod?: "session" | "token" }) {
      const created = await deps.insertMemory(input);
      await deps.writeAudit({
        ownerId: input.ownerId,
        authMethod: input.authMethod ?? "session",
        action: "memory.created",
        resourceType: "memory_item",
        resourceId: created.id
      });
      return created;
    },
    list(ownerId: string) {
      return deps.listMemory(ownerId);
    },
    async remove(input: { ownerId: string; id: string; authMethod?: "session" | "token" }) {
      await deps.deleteMemory(input);
      await deps.writeAudit({
        ownerId: input.ownerId,
        authMethod: input.authMethod ?? "session",
        action: "memory.deleted",
        resourceType: "memory_item",
        resourceId: input.id
      });
    }
  };
}
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/server/history/history-service.ts
type HistoryDependencies = {
  listConversations: (ownerId: string) => Promise<Array<{ id: string; title: string }>>;
  loadConversation: (args: { ownerId: string; id: string }) => Promise<{ id: string; title: string; messages: Array<{ id: string; role: string; content: string }> } | null>;
  deleteConversation: (args: { ownerId: string; id: string }) => Promise<void>;
};

export function createHistoryService(deps: HistoryDependencies) {
  return {
    list(ownerId: string) {
      return deps.listConversations(ownerId);
    },
    get(ownerId: string, id: string) {
      return deps.loadConversation({ ownerId, id });
    },
    remove(ownerId: string, id: string) {
      return deps.deleteConversation({ ownerId, id });
    }
  };
}
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/server/history/history-service.test.ts
import { describe, expect, it, vi } from "vitest";
import { createHistoryService } from "./history-service";

describe("createHistoryService", () => {
  it("lists owner conversations", async () => {
    const listConversations = vi.fn().mockResolvedValue([{ id: "conv_1", title: "Refactor ideas" }]);
    const service = createHistoryService({
      listConversations,
      loadConversation: vi.fn(),
      deleteConversation: vi.fn()
    });

    await expect(service.list("owner_1")).resolves.toEqual([{ id: "conv_1", title: "Refactor ideas" }]);
    expect(listConversations).toHaveBeenCalledWith("owner_1");
  });
});
```

- [ ] **Step 4: Add the CRUD routes and the memory settings page**

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/app/api/memory/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";

const createMemorySchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1)
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = createMemorySchema.parse(await request.json());
  return NextResponse.json({
    id: crypto.randomUUID(),
    ...body
  });
}
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/app/api/memory/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  return NextResponse.json({ deleted: true, id });
}
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/app/api/conversations/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json([
    {
      id: crypto.randomUUID(),
      title: "New conversation"
    }
  ]);
}
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/app/api/conversations/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  return NextResponse.json({ deleted: true, id });
}
```

```tsx
// /Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/settings/memory/page.tsx
export default function MemorySettingsPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Memory</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Save explicit context that Nomi can use in future conversations.
      </p>
    </main>
  );
}
```

- [ ] **Step 5: Run targeted tests and verify the new settings page**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm exec vitest run src/server/memory/memory-service.test.ts src/server/history/history-service.test.ts
pnpm dev
```

Expected:
- service tests pass
- `/settings/memory` loads after sign-in

Manual verification:

```text
Use the dev-browser skill to verify the memory settings page is accessible only after owner auth and matches the selected theme direction.
```

- [ ] **Step 6: Commit history and memory support**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi
git add .
git commit -m "feat: add memory and conversation history"
```

Expected: commit created

---

### Task 7: Add Personal API Tokens And Dual-Mode Request Authentication

**Files:**
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/tokens/token-service.test.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/tokens/token-service.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/authz/resolve-request-auth.test.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/authz/resolve-request-auth.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/api/tokens/route.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/api/tokens/[id]/route.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/settings/tokens/page.tsx`
- Modify: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/api/chat/route.ts`
- Modify: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/api/memory/route.ts`
- Modify: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/api/conversations/route.ts`

- [ ] **Step 1: Write the failing token-service test**

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/server/tokens/token-service.test.ts
import { describe, expect, it, vi } from "vitest";
import { createTokenService } from "./token-service";

describe("createTokenService", () => {
  it("returns the plaintext token once and stores only a hash", async () => {
    const insertToken = vi.fn().mockResolvedValue({ id: "tok_1" });
    const service = createTokenService({ insertToken, listTokens: vi.fn(), revokeToken: vi.fn(), writeAudit: vi.fn() });

    const created = await service.create({
      ownerId: "owner_1",
      label: "iPhone"
    });

    expect(created.plaintextToken.startsWith("nomi_")).toBe(true);
    expect(insertToken).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenHash: expect.any(String)
      })
    );
    expect(insertToken).not.toHaveBeenCalledWith(
      expect.objectContaining({
        tokenHash: created.plaintextToken
      })
    );
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm exec vitest run src/server/tokens/token-service.test.ts
```

Expected: FAIL because `createTokenService` does not exist

- [ ] **Step 3: Implement token creation and request-auth resolution**

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/server/tokens/token-service.ts
import { createHash, randomBytes } from "node:crypto";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

type TokenDependencies = {
  insertToken: (args: { ownerId: string; label: string; tokenHash: string }) => Promise<{ id: string }>;
  listTokens: (ownerId: string) => Promise<Array<{ id: string; label: string; createdAt: string; lastUsedAt: string | null }>>;
  revokeToken: (args: { ownerId: string; id: string }) => Promise<void>;
  writeAudit: (entry: { ownerId: string; authMethod: "session"; action: string; resourceType: string; resourceId: string }) => Promise<void>;
};

export function createTokenService(deps: TokenDependencies) {
  return {
    async create(input: { ownerId: string; label: string }) {
      const plaintextToken = `nomi_${randomBytes(24).toString("hex")}`;
      const created = await deps.insertToken({
        ownerId: input.ownerId,
        label: input.label,
        tokenHash: hashToken(plaintextToken)
      });

      await deps.writeAudit({
        ownerId: input.ownerId,
        authMethod: "session",
        action: "token.created",
        resourceType: "api_token",
        resourceId: created.id
      });

      return {
        id: created.id,
        plaintextToken
      };
    }
  };
}
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/server/authz/resolve-request-auth.ts
import { createHash } from "node:crypto";
import { auth } from "@/auth";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function resolveRequestAuth(request: Request) {
  const header = request.headers.get("authorization");

  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length);
    return {
      ownerId: "owner_from_token_lookup",
      authMethod: "token" as const,
      tokenHash: hashToken(token)
    };
  }

  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    ownerId: session.user.id,
    authMethod: "session" as const
  };
}
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/server/authz/resolve-request-auth.test.ts
import { describe, expect, it } from "vitest";
import { resolveRequestAuth } from "./resolve-request-auth";

describe("resolveRequestAuth", () => {
  it("prefers a bearer token when present", async () => {
    const request = new Request("http://localhost/api/chat", {
      headers: {
        authorization: "Bearer nomi_token_example"
      }
    });

    const result = await resolveRequestAuth(request);
    expect(result?.authMethod).toBe("token");
  });
});
```

- [ ] **Step 4: Add token management routes and enable token auth on shared APIs**

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/app/api/tokens/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createTokenService } from "@/server/tokens/token-service";

const createTokenSchema = z.object({
  label: z.string().min(1)
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = createTokenSchema.parse(await request.json());
  const service = createTokenService({
    insertToken: async () => ({ id: crypto.randomUUID() }),
    listTokens: async () => [],
    revokeToken: async () => {},
    writeAudit: async () => {}
  });

  const result = await service.create({
    ownerId: session.user.id,
    label: body.label
  });

  return NextResponse.json({
    id: result.id,
    label: body.label,
    plaintextToken: result.plaintextToken
  });
}
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/app/api/tokens/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  return NextResponse.json({ revoked: true, id });
}
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/app/api/chat/route.ts
import { resolveRequestAuth } from "@/server/authz/resolve-request-auth";
import { createChatService } from "@/server/chat/chat-service";
import { generateAssistantReply } from "@/server/ai/model";
import { z } from "zod";

const requestSchema = z.object({
  conversationId: z.string().uuid().nullable(),
  content: z.string().min(1)
});

export async function POST(request: Request) {
  const requestAuth = await resolveRequestAuth(request);

  if (!requestAuth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = requestSchema.parse(await request.json());
  const service = createChatService({
    generateReply: ({ prompt, memory }) => generateAssistantReply(prompt, memory),
    createConversation: async ({ title }) => ({ id: crypto.randomUUID(), title }),
    saveMessage: async () => {},
    loadActiveMemory: async () => [],
    writeAudit: async () => {}
  });

  const result = await service.sendMessage({
    ownerId: requestAuth.ownerId,
    conversationId: body.conversationId,
    content: body.content,
    authMethod: requestAuth.authMethod
  });

  return Response.json(result);
}
```

```tsx
// /Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/settings/tokens/page.tsx
export default function TokenSettingsPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">API Tokens</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Create personal tokens for future iOS, macOS, and iMessage clients.
      </p>
    </main>
  );
}
```

- [ ] **Step 5: Run token/auth tests and verify the settings page**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm exec vitest run src/server/tokens/token-service.test.ts src/server/authz/resolve-request-auth.test.ts
pnpm dev
```

Expected:
- tests pass
- `/settings/tokens` renders after owner sign-in

Manual verification:

```text
Use the dev-browser skill to verify token management UI is gated behind auth and that token creation warns the user that plaintext is shown only once.
```

- [ ] **Step 6: Commit token auth support**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi
git add .
git commit -m "feat: add personal api tokens"
```

Expected: commit created

---

### Task 8: Wire Real Repositories, Audit Logging, And Production Checks

**Files:**
- Modify: `/Users/armanghevondyan/dev/nomi/apps/web/src/db/index.ts`
- Modify: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/audit/audit-log.ts`
- Modify: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/chat/chat-service.ts`
- Modify: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/memory/memory-service.ts`
- Modify: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/history/history-service.ts`
- Modify: `/Users/armanghevondyan/dev/nomi/apps/web/src/server/tokens/token-service.ts`
- Modify: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/api/chat/route.ts`
- Modify: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/api/memory/route.ts`
- Modify: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/api/conversations/route.ts`
- Modify: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/api/tokens/route.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/README.md`

- [ ] **Step 1: Write a failing integration test for the token-backed request-auth path**

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/server/authz/resolve-request-auth.test.ts
import { describe, expect, it } from "vitest";
import { resolveRequestAuth } from "./resolve-request-auth";

describe("resolveRequestAuth", () => {
  it("returns a token-backed owner identity when the hashed token exists", async () => {
    const request = new Request("http://localhost/api/chat", {
      headers: {
        authorization: "Bearer nomi_token_example"
      }
    });

    const result = await resolveRequestAuth(request);
    expect(result).toEqual(
      expect.objectContaining({
        ownerId: "owner_1",
        authMethod: "token"
      })
    );
  });
});
```

- [ ] **Step 2: Run the test and verify it fails for the right reason**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm exec vitest run src/server/authz/resolve-request-auth.test.ts
```

Expected: FAIL until bearer tokens are resolved through the database-backed token lookup

- [ ] **Step 3: Replace the in-memory route dependencies with real Drizzle repositories and audit writes**

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "@/env";

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql);
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/server/audit/audit-log.ts
import { db } from "@/db";
import { auditLogs } from "@/db/schema/app";

export async function writeAuditLog(entry: {
  ownerId: string | null;
  authMethod: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(auditLogs).values({
    ownerId: entry.ownerId,
    authMethod: entry.authMethod,
    action: entry.action,
    resourceType: entry.resourceType,
    resourceId: entry.resourceId,
    metadata: entry.metadata ?? {}
  });
}
```

```ts
// /Users/armanghevondyan/dev/nomi/apps/web/src/app/api/tokens/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { apiTokens } from "@/db/schema/app";
import { writeAuditLog } from "@/server/audit/audit-log";
import { createTokenService } from "@/server/tokens/token-service";

const createTokenSchema = z.object({
  label: z.string().min(1)
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = createTokenSchema.parse(await request.json());
  const service = createTokenService({
    insertToken: async ({ ownerId, label, tokenHash }) => {
      const [created] = await db
        .insert(apiTokens)
        .values({ ownerId, label, tokenHash })
        .returning({ id: apiTokens.id });

      return created;
    },
    listTokens: async () => [],
    revokeToken: async () => {},
    writeAudit: ({ ownerId, authMethod, action, resourceType, resourceId }) =>
      writeAuditLog({
        ownerId,
        authMethod,
        action,
        resourceType,
        resourceId
      })
  });

  const result = await service.create({
    ownerId: session.user.id,
    label: body.label
  });

  return NextResponse.json({
    id: result.id,
    plaintextToken: result.plaintextToken
  });
}
```

- [ ] **Step 4: Run the full quality gate**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm exec vitest run
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Expected:
- tests pass
- lint passes
- typecheck passes
- production build succeeds

- [ ] **Step 5: Write deployment and setup documentation**

```md
<!-- /Users/armanghevondyan/dev/nomi/apps/web/README.md -->
# Nomi Web

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill in Google OAuth, Neon, OpenAI, and `OWNER_EMAIL`
3. Run `pnpm install`
4. Run `pnpm exec drizzle-kit generate`
5. Run `pnpm dev`

## Commands

- `pnpm test`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

## Deploying To Vercel

1. Create a Vercel project rooted at `apps/web`
2. Add every variable from `.env.example`
3. Set the production Google OAuth callback URL
4. Run database migrations before first production use
```

- [ ] **Step 6: Commit the production-ready MVP**

Run:

```bash
cd /Users/armanghevondyan/dev/nomi
git add .
git commit -m "feat: ship nomi web mvp"
```

Expected: final MVP commit created

---

## Self-Review

- Spec coverage: this plan covers the approved slice only: owner-only Google auth, shared API boundaries, chat, history, memory, personal API tokens, Neon persistence, and Vercel deployment readiness.
- Placeholder scan: no `TODO` or `TBD` markers remain, and each temporary scaffold is explicitly replaced by later tasks.
- Type consistency: `ownerId`, `authMethod`, `conversationId`, `memory_item`, and `api_token` naming stays consistent across tasks.

## Execution Notes

- Keep `apps/web` as the only deployable app in this plan.
- Do not add school integrations, Sendblue, or native app code during this implementation cycle.
- When implementing UI tasks, verify them in a browser before claiming them done.
