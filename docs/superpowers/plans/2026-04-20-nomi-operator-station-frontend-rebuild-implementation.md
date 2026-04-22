# Nomi Operator Station Frontend Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:executing-plans` to execute this plan task-by-task. Steps use checkbox syntax for progress tracking.

**Goal:** Rebuild the Nomi web frontend into a two-mode operator experience: a multi-route `Station` mission-control console and a dedicated `Chat` workspace. Keep existing Nomi theme colors, support dark and light modes, and implement all workflows with realistic shared mock data before backend wiring.

**Architecture:** Next.js App Router UI with route-scoped feature modules, shared shell primitives, and a single in-memory mock domain store. Every user action writes a timeline event first and then mutates entity state so `Events` remains the operational source of truth.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui primitives, framer-motion (targeted use), Vitest + RTL

---

## Route Map (Target)

- `/station` -> redirects to `/station/dashboard`
- `/station/dashboard`
- `/station/agents`
- `/station/memories`
- `/station/connections`
- `/station/tokens`
- `/station/events`
- `/chat`

---

## Planned File Structure

### Shell and Navigation

- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/components/station/station-shell.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/components/station/station-sidebar.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/components/station/station-topbar.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/components/station/inspector-drawer.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/components/chat/chat-shell.tsx`

### Mock Domain

- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/mock-domain/types.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/mock-domain/seed.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/mock-domain/store.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/mock-domain/selectors.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/mock-domain/actions.ts`

### Route Feature Modules

- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/station/dashboard/*`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/station/agents/*`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/station/memories/*`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/station/connections/*`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/station/tokens/*`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/station/events/*`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/chat/*`

### App Router Pages

- Update: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/layout.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/station/page.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/station/dashboard/page.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/station/agents/page.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/station/memories/page.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/station/connections/page.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/station/tokens/page.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/station/events/page.tsx`
- Update: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/chat/page.tsx`

### Shared UI Primitives

- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/components/ops/status-pill.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/components/ops/event-card.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/components/ops/metric-tile.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/components/ops/provider-card.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/components/ops/action-row.tsx`

### Tests

- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/mock-domain/store.test.ts`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/station/navigation.test.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/station/connections/oauth-flow.test.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/station/tokens/token-actions.test.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/station/events/event-actions.test.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/features/chat/chat-shell.test.tsx`

---

## Task 1: Reframe Protected Routing Around Station + Chat

**Files:**
- Update: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/layout.tsx`
- Create: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/station/page.tsx`
- Create all `/station/*` route pages listed above
- Update: `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/chat/page.tsx`

- [ ] Step 1: Add `station/page.tsx` redirect to `/station/dashboard`.
- [ ] Step 2: Scaffold all target station routes with concrete feature root components.
- [ ] Step 3: Retain auth protection behavior from current protected layout.
- [ ] Step 4: Point existing chat route to the new chat shell entry with baseline functional UI.

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm lint
```

Expected: route tree compiles with no unresolved imports.

---

## Task 2: Build Station Shell and Chat Shell

**Files:**
- Create all `components/station/*` and `components/chat/chat-shell.tsx`
- Update protected layout/page wrappers as needed

- [ ] Step 1: Implement Station shell with left nav entries exactly:
  - Dashboard
  - Agents
  - Memories
  - Connections
  - Tokens
  - Events
  - Chat
- [ ] Step 2: Implement shared top bar (search control, command trigger control, theme toggle, status pulse).
- [ ] Step 3: Add reusable inspector drawer container for route modules.
- [ ] Step 4: Implement Chat shell with chat-focused sidebar and header back button to `/station/dashboard`.
- [ ] Step 5: Verify Chat route fully replaces Station sidebar (no dual-nav bleed).

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm test -- --runInBand src/features/station/navigation.test.tsx
```

Expected: nav and shell-routing behavior is covered and passing.

---

## Task 3: Implement Shared Mock Domain Store

**Files:**
- Create `features/mock-domain/*`

- [ ] Step 1: Define typed entities: `Agent`, `MemoryItem`, `Connection`, `Token`, `Event`, `Conversation`, `Source`, `ModelRun`.
- [ ] Step 2: Add deterministic seed generator for realistic initial telemetry.
- [ ] Step 3: Implement singleton in-memory store and React hook wrapper.
- [ ] Step 4: Implement event-first action pipeline:
  1. emit event
  2. mutate entity
  3. resolve status (`pending|success|failed|retrying`)
- [ ] Step 5: Add selectors for cross-route summaries and per-route projections.

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm test -- --runInBand src/features/mock-domain/store.test.ts
```

Expected: event-first mutation and sync guarantees are validated.

---

## Task 4: Build Dashboard Route (Global Ops Overview)

**Files:**
- Create `/Users/armanghevondyan/dev/nomi/apps/web/src/features/station/dashboard/*`
- Wire `/station/dashboard/page.tsx`

- [x] Step 1: Add health summary block and active-agent status list.
- [x] Step 2: Add recent failures/retries panel with jump links into `/station/events`.
- [x] Step 3: Add latency/cost trend tiles fed by mock model run data.
- [x] Step 4: Add quick actions section linked to tokens, connections, and events workflows.

Expected: dashboard gives high-signal triage view with meaningful links.

---

## Task 5: Build Agents Route (Run Operations)

**Files:**
- Create `/Users/armanghevondyan/dev/nomi/apps/web/src/features/station/agents/*`
- Wire `/station/agents/page.tsx`

- [x] Step 1: Render agent list with live status and recent run metrics.
- [x] Step 2: Add per-agent run timeline excerpt.
- [x] Step 3: Add inspector actions:
  - retry failed run
  - re-run with same context
- [x] Step 4: Ensure actions emit and resolve Events records.

Expected: operators can inspect and operate run failures quickly.

---

## Task 6: Build Memories Route (Editable Memory Inventory)

**Files:**
- Create `/Users/armanghevondyan/dev/nomi/apps/web/src/features/station/memories/*`
- Wire `/station/memories/page.tsx`

- [x] Step 1: Render memory list with provenance and usage markers.
- [x] Step 2: Implement inline edit flow.
- [x] Step 3: Implement delete flow with confirmation.
- [x] Step 4: Emit memory write/delete events and propagate to chat context state.

Expected: memory lifecycle is fully controllable and reflected globally.

---

## Task 7: Build Connections Route (OAuth Visual Flows, Mocked)

**Files:**
- Create `/Users/armanghevondyan/dev/nomi/apps/web/src/features/station/connections/*`
- Wire `/station/connections/page.tsx`

- [x] Step 1: Render provider cards (Google, GitHub) with scope and health metadata.
- [x] Step 2: Implement mocked OAuth visual flow states:
  - disconnected
  - connecting
  - consent_review
  - callback_pending
  - connected
  - degraded
  - disconnecting
  - failed
- [x] Step 3: Implement reconnect/disconnect interactions with confirmation and rollback path.
- [x] Step 4: Emit connection lifecycle events for all transitions.

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm test -- --runInBand src/features/station/connections/oauth-flow.test.tsx
```

Expected: complete mocked OAuth flow is deterministic and test-covered.

---

## Task 8: Build Tokens Route (Credential Operations)

**Files:**
- Create `/Users/armanghevondyan/dev/nomi/apps/web/src/features/station/tokens/*`
- Wire `/station/tokens/page.tsx`

- [x] Step 1: Render token inventory with status, last-used, cost attribution.
- [x] Step 2: Implement create/revoke/pause/resume mocked flows.
- [x] Step 3: Add anomaly indicators (mock heuristic tags).
- [x] Step 4: Ensure token actions update dashboard/events selectors immediately.

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm test -- --runInBand src/features/station/tokens/token-actions.test.tsx
```

Expected: token workflows are stable and cross-route sync is intact.

---

## Task 9: Build Events Route (Canonical Timeline + Incident Workflow)

**Files:**
- Create `/Users/armanghevondyan/dev/nomi/apps/web/src/features/station/events/*`
- Wire `/station/events/page.tsx`

- [x] Step 1: Render full timeline grouped by event type and severity.
- [x] Step 2: Add filter/search controls (type, severity, token, conversation, model).
- [x] Step 3: Implement inspector with required actions:
  - ack/resolve
  - retry failed run
  - re-run prompt with same context
  - pause/resume token (where applicable)
  - memory edit/delete entry points
  - source pin/unpin entry points
- [x] Step 4: Ensure retry lifecycle transitions are explicit in timeline (`queued -> running -> success|failed`).

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm test -- --runInBand src/features/station/events/event-actions.test.tsx
```

Expected: Events works as source-of-truth surface for operations.

---

## Task 10: Rebuild Chat Route as Dedicated Workspace

**Files:**
- Create/update `/Users/armanghevondyan/dev/nomi/apps/web/src/features/chat/*`
- Update `/Users/armanghevondyan/dev/nomi/apps/web/src/app/(protected)/chat/page.tsx`

- [x] Step 1: Build chat-specific sidebar with conversation list and source groups.
- [x] Step 2: Add sidebar header back button to `/station/dashboard`.
- [x] Step 3: Implement message timeline + composer UI using mock conversation data.
- [x] Step 4: Implement source pin/unpin controls that update shared store and emit events.
- [x] Step 5: Add links from chat context to related station events.

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm test -- --runInBand src/features/chat/chat-shell.test.tsx
```

Expected: chat mode is fully separate but operationally connected.

---

## Task 11: Visual Polish, Theming Parity, and Motion Rules

**Files:**
- Update `/Users/armanghevondyan/dev/nomi/apps/web/src/app/globals.css`
- Update/add route and shell component styles

- [ ] Step 1: Preserve existing coral/rust semantic token identity in both themes.
- [ ] Step 2: Implement hybrid intensity rules (quiet baseline, strong critical-state emphasis).
- [ ] Step 3: Ensure readable density for logs/tables/metrics at desktop and mobile breakpoints.
- [ ] Step 4: Restrict motion to meaningful state transitions only.
- [ ] Step 5: Validate focus indicators and contrast in dark/light themes.

Expected: cohesive station aesthetic without generic dashboard/chatbot feel.

---

## Task 12: Regression Pass and Cleanup

**Files:**
- Update relevant tests/snapshots/docs

- [x] Step 1: Run full test suite and fix failing tests.
- [x] Step 2: Run lint and resolve all errors/warnings tied to changed files.
- [x] Step 3: Remove or archive obsolete legacy components/routes replaced by Station+Chat architecture.
- [x] Step 4: Document mock-domain assumptions and backend handoff points in `apps/web/README.md`.

Run:

```bash
cd /Users/armanghevondyan/dev/nomi/apps/web
pnpm lint
pnpm test
```

Expected: clean lint + test run for rebuilt frontend.

---

## Acceptance Criteria

- All target routes exist and match approved IA
- `Chat` route replaces Station sidebar with chat-specific sidebar and back button
- All required operator actions are implemented with mock behavior
- Connections page includes full visual OAuth-style connect/disconnect flows (mocked)
- Tokens route exists with lifecycle controls and usage/cost presentation
- Events route is canonical timeline with ack/resolve and retry workflows
- Dark and light modes are both polished and functional
- Shared mock domain store propagates state changes across all routes

## Out of Scope for This Plan

- Real backend integration for tokens/connections/events/chat telemetry
- Real OAuth provider callbacks and credential storage
- Production incident ingestion pipelines

## Execution Order Recommendation

1. Task 1-3 (routing + shells + domain store)
2. Task 4-9 (station routes)
3. Task 10 (chat rebuild)
4. Task 11-12 (polish + regression)

This sequence minimizes rework by stabilizing app structure before route-specific complexity.
