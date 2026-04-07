# MediAsk Frontend TODO

## P0 Goal

- Build the frontend as a monorepo with two apps: patient H5 and backoffice Web.
- Deliver the demo chain: `login -> AI consultation -> triage result -> registration -> encounter -> EMR -> prescription -> audit`.
- Integrate against real backend contracts defined in `docs/docs/10A-JAVA_AI_API_CONTRACT.md`.

## 1. Monorepo Restructure[DONE]

- Create the workspace layout:
  - `apps/patient-h5`
  - `apps/backoffice-web`
  - `packages/shared-types`
  - `packages/api-client`
- Replace the current single-app demo structure with two business apps.
- Keep shared engineering baseline at the repo root:
  - TypeScript
  - Vite
  - React Router
- Ensure both apps can be developed and built independently.
- Keep dependency changes manual only. Do not modify dependency files to add packages automatically.

## 2. Shared Packages[DONE]

### `packages/shared-types`

- Define `Result<T>` response shape.
- Define `AuthUser`.
- Define AI request and response DTOs.
- Define `TriageResult`.
- Define `RegistrationHandoff`.
- Define `EncounterAiSummary`.
- Define audit DTOs:
  - `AuditEvent`
  - `DataAccessLog`
- Freeze core enums:
  - `riskLevel`: `low | medium | high`
  - `guardrailAction`: `allow | caution | refuse`
  - `nextAction`: `VIEW_TRIAGE_RESULT | GO_REGISTRATION | EMERGENCY_OFFLINE | MANUAL_SUPPORT`

### `packages/api-client`

- Implement a shared API layer using native `fetch`.
- Inject `Authorization: Bearer <token>` automatically.
- Parse all JSON responses as `Result<T>`.
- Handle auth states centrally:
  - `401`: clear session state and redirect to `/login`
  - `403`: show permission error
- Provide SSE support for AI consultation:
  - `message`
  - `meta`
  - `end`
  - `error`

## 3. Patient App: `apps/patient-h5` [IN PROGRESS]

### Shared/API
- [ ] Remove `src/services/mock/api.ts` entirely and replace all imports with real API client calls.

### Routes & Pages

- [x] **Login page** (`/login`)
  - [x] Connect `/api/v1/auth/login`
  - [x] Connect `/api/v1/auth/me`
  - [x] H5 UI adaptation with appropriate safe-area padding

- [ ] **AI consultation page** (`/ai/session/:sessionId`)
  - [ ] Connect `/api/v1/ai/chat/stream` using `connectAiChatStream`
  - [ ] Stream answer rendering with blinking cursor for typing effect
  - [x] Markdown safe rendering (sanitize HTML) and mobile typography
  - [ ] Consume `meta.triageResult` as the only structured truth
  - [ ] Preserve history and `requestId` on failure, with local "retry" button to avoid white screen

- [ ] **Triage result page** (`/triage/result/:sessionId`)
  - [ ] Connect `/api/v1/ai/sessions/{sessionId}/triage-result`
  - [x] Show recommended departments, care advice, citations, next action using mobile card layout

- [ ] **High-risk page** (`/triage/high-risk/:sessionId`)
  - [x] Only handle `EMERGENCY_OFFLINE` and `MANUAL_SUPPORT`
  - [x] Do not continue normal consultation flow
  - [x] Use strong visual blocking (danger red color `#FF4D4F`/`red-500`) and prominent "emergency call" actions

- [ ] **Registration page** (`/registrations/new`)
  - [ ] Connect `/api/v1/ai/sessions/{sessionId}/registration-handoff`
  - [ ] Connect `/api/v1/clinic-sessions`
  - [ ] Connect `/api/v1/registrations` for submission
  - [x] Use Skeleton/pulse loading states instead of full-page spinners
  - [x] Fixed bottom action bar (safe-area adapted) for main actions like "Submit"

- [ ] **My registrations page** (`/registrations`)
  - [ ] Connect `/api/v1/registrations`

### Rules

- Do not infer business decisions from AI natural language.
- Only trust `meta.triageResult` and `nextAction`.
- Render AI output safely. Never inject raw HTML.
- Keep the H5 UI optimized for mobile layout and large tap targets.

## 4. Backoffice App: `apps/backoffice-web`[DONE]

### Routes

- `/workbench`
- `/encounters`
- `/encounters/:id`
- `/emr/:encounterId`
- `/prescriptions/:encounterId`
- `/audit`

### Pages

- Workbench
  - Minimal navigation
  - Pending encounter entry
- Encounter list and detail
  - `/api/v1/encounters`
  - `/api/v1/encounters/{encounterId}`
  - `/api/v1/encounters/{encounterId}/ai-summary`
- EMR editor
  - `/api/v1/emr`
  - `/api/v1/emr/{encounterId}`
- Prescription editor
  - `/api/v1/prescriptions`
  - `/api/v1/prescriptions/{encounterId}`
- Audit page
  - `/api/v1/audit/events`
  - `/api/v1/audit/data-access`

### Rules

- Show AI summary by default, not raw AI transcript.
- Keep the backoffice UI optimized for dense desktop workflows.
- Apply a consistent light theme at the app root.