# Nomi Operator Station Frontend Rebuild Design

## Overview

This document defines a complete rebuild of the Nomi web frontend as an operator-style local debug station, while preserving the existing Nomi theme color system.

The rebuilt product has two primary modes:

- `Station` mode: a multi-route mission-control console for observability and operations
- `Chat` mode: a dedicated chat workspace with its own sidebar and navigation context

The first implementation phase is frontend-first and mock-data-driven. Backend integration is intentionally deferred until the visual and interaction model is approved.

## Product Goals

- Rebuild the entire web UI with a new information architecture and interaction model
- Preserve the existing warm coral/rust theme token family
- Make the web app feel like an operator debug station, not a generic chatbot UI
- Provide deep visibility into system behavior (events, agents, memory, tokens, connections, cost, latency, failures)
- Provide operator controls directly from the UI (retry, re-run, pause/resume, edit/delete, ack/resolve, pin/unpin)
- Keep a dedicated, focused chat page for conversation work
- Ship dark and light themes (dark default)

## Non-Goals (Phase 1)

- Real backend wiring for observability and operations
- Real OAuth credential exchanges or token lifecycle execution
- Production accuracy of telemetry values
- Reworking server/domain contracts in this phase

## Design Principles

1. Operator-first: optimize for fast diagnosis and control.
2. Event-centered truth: state changes are understandable through event history.
3. Calm baseline, selective intensity: quiet default UI with high-contrast treatment only for critical states.
4. One cohesive system: Station and Chat share the same visual language and global shell primitives.
5. Mock-realism: interactions should behave plausibly now so backend swap-in later is low-risk.

## Information Architecture

### Top-Level Routes

- `/station` (redirects to `/station/dashboard`)
- `/station/dashboard`
- `/station/agents`
- `/station/memories`
- `/station/connections`
- `/station/tokens`
- `/station/events`
- `/chat`

### Navigation Model

#### Station Sidebar (all `/station/*`)

Order and labels:

1. Dashboard
2. Agents
3. Memories
4. Connections
5. Tokens
6. Events
7. Chat

`Chat` is an explicit transition into a different route shell.

#### Chat Sidebar (`/chat`)

- Replaces the Station sidebar completely
- Header includes a back button returning to `/station/dashboard`
- Sidebar is conversation-focused (thread list, source pins, quick context tools)

## Route Intent and Page Contracts

### `/station/dashboard`

Purpose:

- High-signal operational overview
- Fast triage entry point

Primary content:

- System health summary
- Active agent states
- Recent failures/retries
- Cost and latency trend modules
- Quick action queue linking into route-specific workflows

### `/station/agents`

Purpose:

- Observe and operate agent runs

Primary content:

- Agent list with run states
- Run history slices
- Inspector actions: retry failed run, re-run with same context

### `/station/memories`

Purpose:

- Manage explicit memory artifacts with provenance

Primary content:

- Memory inventory
- Usage markers and source references
- Inline edit/delete controls
- Event-linked change history

### `/station/connections`

Purpose:

- Manage external provider integrations (for example Google, GitHub)

Primary content:

- Provider cards with state, scopes, last sync/use, health
- Visual OAuth flow states (mocked): connect -> consent -> callback/loading -> connected
- Disconnect/reconnect controls with risk confirmation and failure simulation

### `/station/tokens`

Purpose:

- Manage API credentials and token-level operations

Primary content:

- Token inventory with status, scope, labels
- Usage and cost attribution by token
- Pause/resume/revoke/create flows (mocked state machine)
- Security/anomaly flags (mocked heuristics)

### `/station/events`

Purpose:

- Canonical event timeline and incident workflow

Primary content:

- Full timeline feed (filterable/searchable)
- Severity and subsystem filtering
- Event inspector with ack/resolve/retry/re-run context actions

### `/chat`

Purpose:

- Focused conversation workspace separate from Station

Primary content:

- Conversation list/sidebar
- Message timeline and composer
- Sources/context strip with pin/unpin controls
- Links to related operational events in Station

## Shared Shell System

### Station Shell

Persistent across all `/station/*` routes:

- Left sidebar nav
- Top command bar (search and command palette entry)
- Theme toggle (dark default + light)
- System status pulse indicator
- Optional reusable right inspector drawer

### Chat Shell

- Dedicated sidebar (chat context)
- Back navigation to Station
- Shared top-level UI language and token usage

## Visual System (Keep Existing Theme Colors)

### Theme

- Dark-first visual posture for late-night/operator usage
- Fully supported light mode parity
- Preserve existing coral/rust token identity and semantic mappings

### Tone

- Hybrid ops aesthetic:
  - calm and readable for baseline activity
  - intensified visuals for failures, retries, degraded states, and urgent incidents

### Typography and Density

- Use compact operator hierarchy for scanability
- Prioritize numeric and status legibility in dense surfaces
- Avoid generic chatbot or dashboard-card repetition patterns

### Motion

- Minimal default motion
- Emphasized transitions for state changes only:
  - new event arrival
  - retry pending/success/failure
  - connect/disconnect state transitions

## Interaction Model

### Core Operator Actions (Phase 1, Mocked)

1. Retry failed run
2. Pause/resume token
3. Inline memory edit/delete
4. Re-run prompt with same context
5. Event-level acknowledge/resolve
6. Conversation source pin/unpin

### Behavioral Rules

- Selecting an event updates the inspector immediately
- User actions apply optimistic local updates first
- Each action emits timeline events, then resolves to success/failure state
- Errors always surface clear recovery actions

## Domain Model for Mocked Frontend

Single shared in-memory domain store (with deterministic seed data):

- `agents`
- `memories`
- `connections`
- `tokens`
- `events`
- `conversations`
- `sources`
- `modelRuns`

### Event-First Mutation Contract

Every mutation follows:

1. Append event record
2. Update target entity state
3. Resolve action status (`pending | success | failed | retrying`)

This makes `Events` the operational source of truth and enables consistent cross-route synchronization.

### Cross-Route Synchronization Requirements

- Token state changes reflect in Dashboard, Tokens, Agents, and Events
- Memory edits/deletes reflect in Memories, Chat context, and Events
- Connection changes reflect in Connections, Dashboard health, and Events
- Re-run/retry actions reflect in Agents, Events, and related conversation context

## OAuth Visual Flow Contract (Mocked)

Connections must feel production-real even before backend integration.

States:

- `disconnected`
- `connecting`
- `consent_review`
- `callback_pending`
- `connected`
- `degraded`
- `disconnecting`
- `failed`

Required UX:

- Connect action enters consent preview state
- Callback/loading state displayed before completion
- Reconnect and disconnect affordances include confirmations
- Failure and rollback states are visible and recoverable

## Error and Retry Design

- Errors are represented as first-class timeline events
- Retry actions are contextual from event inspector and relevant route modules
- Retry lifecycle is explicit (`queued -> running -> success|failed`)
- Ack/resolve is separate from retry and tracked independently

## Component Architecture (Frontend)

Recommended top-level structure:

- `station-shell` (layout + nav + command bar + status)
- `chat-shell` (chat sidebar + back navigation)
- route feature modules:
  - `dashboard/*`
  - `agents/*`
  - `memories/*`
  - `connections/*`
  - `tokens/*`
  - `events/*`
  - `chat/*`
- shared primitives:
  - status badges
  - event cards
  - inspector panels
  - provider cards
  - token controls
- mock domain layer:
  - seeded fixtures
  - state store
  - mutation/action handlers

## Accessibility and Responsiveness

- Keyboard-navigable sidebars, timelines, and inspector controls
- Clear focus states in both light and dark themes
- Desktop: persistent sidebar + optional inspector drawer
- Tablet/mobile: sidebar and inspector become sheets/drawers without removing critical actions

## Testing Strategy (Phase 1)

Focus on interaction correctness with mock data:

- Route rendering smoke tests for all Station and Chat routes
- Action tests for each operator contract
- State propagation tests across routes (shared store sync)
- Theme parity checks (light/dark)
- Critical accessibility checks (focus order, labeled controls)

## Backend Integration Readiness Criteria

The frontend architecture is considered ready for backend wiring when:

- All route contracts and action states are stable under mock data
- Event-first mutation model is consistent and debuggable
- OAuth/token/memory operation flows are visually complete
- Cross-route synchronization behavior is verified
- No major IA or shell changes are pending

## Risks and Mitigations

- Risk: Over-scoped first pass with too many complex surfaces
  - Mitigation: shared shell primitives and reusable inspector/action contracts
- Risk: Inconsistent state between routes
  - Mitigation: single domain store + event-first mutation pattern
- Risk: UI churn during backend wiring
  - Mitigation: stabilize action payload/response shapes now using typed mocks

## Phase 1 Deliverable

A fully rebuilt, production-grade frontend experience with:

- complete new IA and routing
- mission-control Station mode
- dedicated Chat mode with sidebar swap and back navigation
- realistic operator interactions via shared mock state
- dark and light theme support using existing Nomi color identity

This UI becomes the canonical target for backend integration in the next phase.
