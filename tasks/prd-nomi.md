# PRD: Nomi

## Introduction

Build `Nomi`, a private personal AI assistant that helps a single user with general questions, coding tasks, and eventually school-related workflows. The long-term product vision includes a Next.js web app, native SwiftUI apps for iOS and macOS, and iMessage access through Sendblue, all backed by a cloud-hosted service that is always available.

This PRD defines the Phase 1 foundation and MVP. Phase 1 focuses on a secure, single-user, web-first assistant deployed on Vercel with strong authentication, conversational AI features, memory, and a clear architecture for later expansion into native clients, iMessage, and school-system access. The system must be deployable to the public internet without being usable by other people or exposing paid APIs to abuse.

## Goals

- Ship a private, single-user AI assistant that only the owner can access.
- Provide a high-quality chat experience for general questions and coding help.
- Use Next.js and the Vercel AI SDK as the core web and backend stack.
- Establish a backend architecture that can later support SwiftUI iOS, SwiftUI macOS, and iMessage clients without major rewrites.
- Support secure configuration of private credentials and service URLs through environment variables.
- Prevent unauthorized users from invoking models, tools, or automations through the deployed app.

## User Stories

### US-001: Create secure single-user authentication
**Description:** As the owner, I want the assistant to require strong authentication so that no one else can access my deployed backend or consume my API budget.

**Acceptance Criteria:**
- [ ] The web app requires authentication before showing the assistant UI.
- [ ] Only one approved user identity can sign in successfully.
- [ ] Unauthenticated requests to protected assistant routes return an authorization error.
- [ ] Authenticated user identity is available to server-side code before model or tool execution starts.
- [ ] Typecheck/lint passes

### US-002: Build the web chat interface
**Description:** As the owner, I want a polished chat UI in the web app so that I can ask general questions and request coding help from one place.

**Acceptance Criteria:**
- [ ] The web app has a chat screen with a message list, composer, loading state, and error state.
- [ ] The chat UI supports multi-turn conversations.
- [ ] Streaming responses are rendered incrementally in the interface.
- [ ] The chat screen works on desktop and mobile browser sizes.
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-003: Integrate model-backed assistant responses
**Description:** As the owner, I want the assistant to answer general questions and coding questions so that it is useful immediately in the MVP.

**Acceptance Criteria:**
- [ ] The backend can send chat messages to a configured LLM using the Vercel AI SDK.
- [ ] The assistant returns useful text responses for both general-purpose prompts and coding prompts.
- [ ] Model configuration is controlled by server-side environment variables, not client-side values.
- [ ] Failed model calls show a safe error message without leaking secrets.
- [ ] Typecheck/lint passes

### US-004: Add personal memory and conversation persistence
**Description:** As the owner, I want conversations and saved context to persist so that the assistant can stay useful across sessions.

**Acceptance Criteria:**
- [ ] Conversation history is stored server-side and can be re-opened later.
- [ ] The assistant can store owner-approved personal preferences or notes as structured memory.
- [ ] Memory retrieval is scoped to the authenticated owner only.
- [ ] The owner can delete a saved conversation or memory item.
- [ ] Typecheck/lint passes

### US-005: Add secure environment-based configuration
**Description:** As the developer, I want credentials, login data, and target URLs stored in environment variables so that sensitive configuration is not hardcoded.

**Acceptance Criteria:**
- [ ] The app reads required secrets and private configuration from environment variables.
- [ ] A documented list of required environment variables exists for local and Vercel deployment.
- [ ] Missing required environment variables fail fast with clear server-side errors.
- [ ] No secrets or credentials are exposed to client-side bundles.
- [ ] Typecheck/lint passes

### US-006: Define protected tool execution boundaries
**Description:** As the owner, I want future tool use to be gated so that high-risk actions cannot run silently or be abused.

**Acceptance Criteria:**
- [ ] The backend defines separate categories for read-only tools and action-taking tools.
- [ ] Tool invocation requires an authenticated owner session.
- [ ] The system logs tool requests with timestamp, tool name, and result status.
- [ ] High-risk tools are marked as disabled or approval-required in the MVP.
- [ ] Typecheck/lint passes

### US-007: Prepare client architecture for iOS, macOS, and iMessage
**Description:** As the developer, I want a stable API contract so that native SwiftUI apps and Sendblue-based iMessage integration can be added later without redesigning the backend.

**Acceptance Criteria:**
- [ ] The backend exposes a documented API surface for chat and history retrieval.
- [ ] The API uses token- or session-based access patterns that can support non-web clients later.
- [ ] Shared request and response shapes are defined clearly enough for future native clients.
- [ ] MVP decisions do not assume the web client is the only consumer forever.
- [ ] Typecheck/lint passes

### US-008: Document future school access phase
**Description:** As the owner, I want the product plan to account for Google Classroom, Canvas, and student portal access so that the MVP does not block those future integrations.

**Acceptance Criteria:**
- [ ] The product documentation identifies school access as a later phase, not part of the MVP release.
- [ ] The plan distinguishes between official API integrations and browser-automation-based access.
- [ ] The plan marks school credentials and automation as high-risk capabilities.
- [ ] The plan states that assignment submission, messaging, and grade-changing actions are out of scope for the MVP.
- [ ] Typecheck/lint passes

## Functional Requirements

- FR-1: The system must provide a Next.js web application as the first client surface.
- FR-2: The system must use the Vercel AI SDK for model communication and streaming assistant responses.
- FR-3: The deployed system must require authentication before any chat UI, model call, memory access, or tool execution is allowed.
- FR-4: The system must allow only the owner account to access the production assistant.
- FR-5: The system must prevent anonymous or unauthorized users from invoking backend model routes.
- FR-6: The system must store all model provider keys, login values, and target service URLs in environment variables.
- FR-7: The system must not expose secrets, credentials, or internal endpoints to the client.
- FR-8: The system must support multi-turn conversations with persistent conversation history.
- FR-9: The system must provide a chat interface for general questions and coding help in MVP.
- FR-10: The system must stream assistant responses to the UI.
- FR-11: The system must support server-side storage and retrieval of owner-approved personal memory.
- FR-12: The system must allow the owner to view and delete stored chats and memory items.
- FR-13: The system must log authentication attempts, assistant requests, and tool execution events.
- FR-14: The system must define a permission model for future tools, distinguishing read-only access from action-taking access.
- FR-15: The MVP must keep high-risk tools disabled or behind explicit approval gates.
- FR-16: The backend must provide an API contract that can later be consumed by SwiftUI iOS and macOS clients.
- FR-17: The backend must be designed so Sendblue iMessage integration can be added later as another authenticated client channel.
- FR-18: The product documentation must define Google Classroom, Canvas, and student portal access as a later phase.
- FR-19: For future school integrations, the system must prefer official APIs when available but may support browser automation where no practical API exists.
- FR-20: Any future school automation must keep credentials server-side and must never expose them to clients.
- FR-21: The MVP must be deployable on Vercel in a way that is reachable from the internet but only usable by the authenticated owner.

## Non-Goals

- No multi-user support in the MVP.
- No public sign-up, invitations, or shared workspaces.
- No direct school-system access in the MVP.
- No assignment submission, messaging, enrollment changes, or grade-changing actions in the MVP.
- No autonomous browser automation running unattended in the MVP.
- No iOS app, macOS app, or iMessage production release in the MVP.
- No marketplace, team features, or consumer-facing productization in the MVP.

## Design Considerations

- `Nomi` should feel polished and personal, not like a generic chatbot shell.
- The web UI should prioritize fast chat, readable long-form answers, and clear visibility into assistant state.
- The UI should clearly indicate when a feature is unavailable, pending approval, or planned for a later phase.
- Authentication and privacy messaging should be obvious to reinforce that this is a private, single-user system.
- The web UI should use the selected `shadcn/ui` theme from TweakCN as the starting visual language: `https://tweakcn.com/r/themes/cmo1s6k3r000804l59ehggmgx`.

## Technical Considerations

- Use Next.js as the primary application framework.
- Use the Vercel AI SDK for streaming chat and model orchestration.
- Use `shadcn/ui` for the web component system, with the TweakCN theme installed via `pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/cmo1s6k3r000804l59ehggmgx` when UI implementation begins.
- Deploy the web app and backend routes on Vercel.
- Use a persistent data store for chats, memory, audit logs, and configuration metadata.
- Use a production authentication provider or custom auth approach that supports strict allowlisting of a single owner identity.
- Keep all secrets in local `.env` files for development and Vercel environment variables for deployment.
- Treat stored school login information as highly sensitive. If later stored at rest, it should be encrypted and only accessed on the server.
- Browser automation for school systems is a future capability and should be isolated from the core assistant runtime where possible.
- Native SwiftUI apps and Sendblue integration should consume stable server APIs instead of duplicating backend logic.
- Rate limiting, request logging, and server-side authorization checks are required even for a single-user deployment because the public URL will still be discoverable.

## Success Metrics

- The owner can sign in and use the deployed assistant without any other user being able to access it.
- The assistant reliably answers general-purpose questions and coding questions through the web app.
- A complete chat round trip, including streaming, works in production deployment on Vercel.
- Conversation history and saved memory persist across sessions for the owner.
- No secrets are exposed in client code, logs, or error messages.
- The codebase architecture is ready for later iOS, macOS, iMessage, and school-integration phases without major backend redesign.

## Open Questions

- Which authentication product should be used for strict single-user access in production?
- Which database should store chat history, memory, and audit logs?
- Should the first native release be iOS, macOS, or both at the same time after the web MVP?
- Should iMessage support be read-only at first, or should it support full conversational replies from day one?
- For Google Classroom and Canvas, which capabilities should be read-only first: assignments, due dates, announcements, or grades?
- For the student portal, is access technically possible through an official API, or will browser automation be required?
- If browser automation is used later, what explicit approval flow should be required before the assistant logs into a school system?
- The response `1AC` suggests both a private all-in-one assistant goal and a polished cross-platform ambition. This PRD treats the first as the MVP goal and the second as a product direction. Confirm if that prioritization is correct.
