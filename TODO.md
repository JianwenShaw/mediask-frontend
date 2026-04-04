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

## 3. Patient App: `apps/patient-h5`

### Routes

- `/login`
- `/ai/session/:sessionId`
- `/triage/result/:sessionId`
- `/triage/high-risk/:sessionId`
- `/registrations/new`
- `/registrations`

### Pages

- Login page
  - `/api/v1/auth/login`
  - `/api/v1/auth/me`
- AI consultation page
  - `/api/v1/ai/chat/stream`
  - Stream answer rendering
  - Consume `meta.triageResult` as the only structured truth
  - Preserve history and `requestId` on failure
- Triage result page
  - `/api/v1/ai/sessions/{sessionId}/triage-result`
  - Show recommended departments, care advice, citations, next action
- High-risk page
  - Only handle `EMERGENCY_OFFLINE` and `MANUAL_SUPPORT`
  - Do not continue normal consultation flow
- Registration page
  - `/api/v1/ai/sessions/{sessionId}/registration-handoff`
  - `/api/v1/clinic-sessions`
  - `/api/v1/registrations`
- My registrations page
  - `/api/v1/registrations`

### Rules

- Do not infer business decisions from AI natural language.
- Only trust `meta.triageResult` and `nextAction`.
- Render AI output safely. Never inject raw HTML.
- Keep the H5 UI optimized for mobile layout and large tap targets.

## 4. Backoffice App: `apps/backoffice-web`

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