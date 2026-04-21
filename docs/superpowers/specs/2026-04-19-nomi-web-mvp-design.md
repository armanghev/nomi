# Nomi Web MVP Design

## Overview

`Nomi` is a private, single-user AI assistant built first as a Next.js web app and deployed on Vercel. The initial product slice includes:

- a protected web chat interface
- Google sign-in with strict owner-only access
- streamed assistant responses using the Vercel AI SDK
- persistent chat history and owner-approved memory stored in Neon
- a future-client-ready backend contract for later iOS, macOS, and iMessage clients

This design deliberately excludes school integrations, browser automation, Sendblue integration, native apps, and autonomous action-taking tools. The purpose of this slice is to ship a secure, usable private assistant without prematurely expanding into the highest-risk areas.

## Product Scope

### In Scope

- Next.js web app as the first user-facing client
- `Auth.js` with Google OAuth as the only interactive sign-in flow
- hard allowlist of exactly one owner email
- Neon Postgres for persistence
- chat, memory, history, token metadata, and audit logging
- stable API routes and service boundaries so future non-web clients can reuse the same backend
- owner-managed personal API tokens for future native and iMessage clients

### Out of Scope

- email/password authentication
- public sign-up or multi-user support
- Google Classroom, Canvas, or student portal access
- browser automation or unattended background agents
- Sendblue/iMessage implementation
- iOS or macOS app implementation
- tool execution beyond clearly bounded future extension points

## Goals

- Ship a private assistant that only the owner can access.
- Support high-quality chat for general questions and coding help.
- Keep the deployed Vercel app publicly reachable but functionally private.
- Persist chats and explicit memory cleanly in Neon.
- Avoid a web-only architecture trap by designing stable service and API boundaries now.
- Prepare for future iOS, macOS, and iMessage clients without implementing them yet.

## Non-Goals

- Building a consumer-facing assistant product
- Solving school-system automation in v1
- Building a fully separate backend platform before product value is proven
- Supporting multiple auth providers or multiple human users

## Architecture

`Nomi` will be a single Next.js deployment that hosts the web UI, route handlers, and authentication entry points. It is intentionally not designed as a web-only monolith. Core assistant behavior will live in shared server-side service modules so both the web client and future non-web clients can use the same domain logic.

The first-slice architecture is:

- Next.js App Router for pages and API route handlers
- `Auth.js` for Google OAuth-based owner sign-in
- Neon Postgres for application data
- shared server services for auth resolution, chat, memory, history, token management, and audit logging

The route layer should stay thin. Its job is to:

1. authenticate the request
2. validate input
3. call a shared service
4. write an audit log event where applicable
5. return a structured response or streamed output

This architecture keeps deployment simple while preserving clean service boundaries.

## Authentication And Authorization

### Web Authentication

The only interactive sign-in method in the first slice is Google OAuth via `Auth.js`.

After Google sign-in succeeds, the backend must compare the returned email to a single allowlisted owner email stored in environment configuration, such as `OWNER_EMAIL`. If the email does not match exactly, the session must be rejected and the user must not gain access to any assistant surface.

There is no email/password fallback.

### Future Client Authentication

The first slice will also include personal API tokens for future non-web clients. These are not public developer API keys and are not part of a multi-user platform. They are owner-managed credentials that exist so later SwiftUI and Sendblue-based clients can authenticate without redesigning the backend.

Requirements:

- tokens must be created and revoked by the authenticated owner only
- plaintext token values must be shown only once at creation time
- stored tokens must be hashed in Neon, not stored in plaintext
- token-authenticated requests must resolve to the same owner identity model used by web sessions

### Authorization Model

Every protected route must verify one of:

- a valid owner web session, or
- a valid owner API token

Authorization must happen server-side on every request. Hiding UI controls is not a protection boundary.

Protected areas include:

- chat routes
- conversation history routes
- memory routes
- token management routes
- future tool routes

## Data Model

The Neon schema should remain small and explicit in the first slice.

### Core Tables

- `users`
  Purpose: canonical owner record, even if only one owner account exists

- Auth.js adapter tables
  Purpose: accounts, sessions, verification data, and related auth state required by `Auth.js`

- `conversations`
  Purpose: top-level chat threads owned by the authenticated user

- `messages`
  Purpose: ordered user and assistant messages associated with a conversation

- `memory_items`
  Purpose: explicit saved facts, preferences, or durable context approved by the owner

- `api_tokens`
  Purpose: hashed personal tokens and token metadata for future clients

- `audit_logs`
  Purpose: append-only records of auth attempts, assistant requests, memory changes, token usage, and future tool execution

### Data Principles

- all records are owner-scoped even if only one owner exists today
- memory is explicit and manageable, not a silent dump of all conversation content
- audit logging is append-only and should support later debugging and security review
- token values must never be recoverable after initial creation

## API Surface

The first slice should expose a narrow, stable backend contract.

### Chat

- `POST /api/chat`
  Accepts conversation context and a new user message, authenticates the owner, assembles prompt context, calls the model through the Vercel AI SDK, streams the response, persists the result, and writes an audit event.

### Conversations

- `GET /api/conversations`
  Returns the owner’s conversation list

- `GET /api/conversations/:id`
  Returns one conversation with its messages

- `DELETE /api/conversations/:id`
  Deletes one conversation owned by the authenticated owner

### Memory

- `GET /api/memory`
  Returns memory items for the owner

- `POST /api/memory`
  Creates a memory item

- `DELETE /api/memory/:id`
  Deletes a memory item

### Tokens

- `POST /api/tokens`
  Creates a new personal API token and returns the plaintext token once

- `GET /api/tokens`
  Returns token metadata only

- `DELETE /api/tokens/:id`
  Revokes a token

## Service Boundaries

The web client and future clients must share domain logic rather than duplicating it in route handlers. The code should be organized around focused responsibilities.

Recommended service boundaries:

- `authz`
  Resolves request identity and enforces owner-only access

- `chat`
  Builds chat context, calls the model via the Vercel AI SDK, persists messages, and coordinates streaming

- `history`
  Lists, loads, and deletes conversations

- `memory`
  Creates, lists, retrieves, and deletes explicit memory items

- `tokens`
  Creates, hashes, lists, and revokes personal API tokens

- `audit`
  Writes structured security and product events

Each service should be independently testable without requiring the web UI.

## Chat And Memory Behavior

### Chat

The first slice supports:

- general-purpose question answering
- coding assistance
- multi-turn conversation history
- streamed responses in the web UI

The server should:

1. authenticate the owner
2. load recent conversation context
3. load relevant explicit memory if configured to do so
4. call the model using the Vercel AI SDK
5. stream the assistant output back to the client
6. persist the final request/response pair
7. log the request in `audit_logs`

### Memory

Memory is explicit and owner-controlled.

The first slice should support:

- storing saved preferences or notes
- listing saved memory items
- deleting memory items

The first slice should not:

- silently infer and save every possible fact from conversations
- perform background memory extraction jobs
- merge memory with external school or browser data

## Safety Boundaries

This slice must remain conversational and stateful, but not autonomous.

Explicitly excluded in the first implementation plan:

- Google Classroom, Canvas, and student portal integrations
- Sendblue integration
- browser automation
- unattended background actions
- high-risk action-taking tools

If future tools are added, the system must distinguish between:

- read-only capabilities
- action-taking capabilities

The first slice should establish the permission boundary concept, but not ship risky external-action tools.

## Deployment Model

The app will be deployed on Vercel and reachable on a public URL. Public reachability does not imply public usability.

The privacy model is:

- anyone can technically reach the site URL
- only the owner’s Google account can establish a valid web session
- only owner-created personal API tokens can authenticate future non-web clients
- protected routes reject unauthorized access before any model or data access occurs

This approach keeps the assistant always available without exposing model usage or private data to other users.

## Environment Configuration

Sensitive configuration must be server-side only.

Expected categories of environment variables:

- Google OAuth credentials
- `Auth.js` secrets and base URL configuration
- owner allowlist email
- Neon connection strings
- model provider credentials
- future service credentials

Rules:

- secrets must never be exposed to the browser bundle
- missing required environment variables should fail fast with clear server-side errors
- credentials for future school systems must remain out of scope for this slice

## Error Handling

The first slice should provide clear, safe failures.

Examples:

- unauthorized session or bad token returns a clear authorization failure
- missing config returns a controlled server-side configuration error
- model failures return a generic assistant error without leaking secrets
- deleted or missing resources return clear not-found behavior for the owner

Audit logging should record enough context to diagnose failures without storing sensitive plaintext secrets.

## Testing Strategy

The implementation plan should use test-first development for behavior changes and new services.

Critical test areas:

- owner-email allowlist enforcement
- route protection for both session and token auth
- conversation persistence behavior
- memory CRUD behavior
- token hashing and one-time token reveal behavior
- audit log creation for sensitive operations
- streamed chat response flow

UI stories should include browser verification once implementation begins.

## Implementation Sequence

### Phase 1: Foundation

- scaffold the Next.js app
- integrate `Auth.js` with Google sign-in
- enforce a single allowlisted owner email
- connect Neon
- establish database schema and migration flow

### Phase 2: Core Assistant

- build the protected chat UI
- implement streamed `POST /api/chat`
- persist conversations and messages
- add audit logging around auth and chat requests

### Phase 3: Durable Context

- add memory CRUD
- connect explicit memory retrieval into chat context assembly
- add conversation history views and deletion flows

### Phase 4: Future-Client Readiness

- add owner-managed personal API tokens
- support token auth on selected API routes
- document and stabilize the API contract for future native and iMessage clients

## Open Questions

- Which specific Neon adapter and migration tooling should be used with `Auth.js` in this repo?
- Which model provider will back the Vercel AI SDK in the first implementation?
- How should explicit memory be selected for inclusion in chat context in v1: manual selection, always include, or simple relevance heuristics?
- When iOS/macOS work starts, should token-based auth remain primary for native clients or evolve toward device-bound credentials later?

## Decision Summary

The approved first slice is:

- shared Next.js web app and API deployment
- Google OAuth only via `Auth.js`
- exactly one allowlisted owner email
- Neon as the database
- web MVP now
- personal API tokens implemented now for future native/iMessage clients
- no school integrations or automation in this slice
