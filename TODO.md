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

### UI/UX Refinements (docs/08A-DESIGN_GUIDELINES.md)
- [ ] **Markdown & Security**: Implement actual Markdown rendering and XSS sanitization (`react-markdown`, `dompurify` or `rehype-sanitize`) in `ai-session-page.tsx`.
- [ ] **Active States**: Add tap feedback (`active:bg-green-600`, `active:scale-95`, etc.) to all interactive elements across H5 pages.
- [ ] **Skeleton Screens**: Ensure network request loading states use skeleton (`animate-pulse`) instead of full-page spinners, especially in `triage-result-page.tsx` and `registrations-page.tsx`.
- [ ] **Typing Cursor**: Ensure the blinking cursor works correctly with the real SSE stream and Markdown rendering.

- [x] **Login page** (`/login`)
  - [x] Connect `/api/v1/auth/login`
  - [x] Connect `/api/v1/auth/me`
  - [x] H5 UI adaptation with appropriate safe-area padding

- [ ] **AI consultation page** (`/ai/session/:sessionId`)
  - [ ] Connect `/api/v1/ai/chat/stream` using `connectAiChatStream`
  - [ ] Stream answer rendering with blinking cursor for typing effect
  - [ ] FIX: Markdown safe rendering (sanitize HTML) and mobile typography (Needs real markdown parser and sanitization)
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

## 5. Backoffice RAG Testing Module UI/UX [PLAN]

### 📍 1. Menu & Navigation
- [x] Add "Retrieval & Testing" (Playground) tab inside the Knowledge Base detail page.

### 🎨 2. Playground Layout (Split View)
- [x] Implement a split-pane layout using Ant Design `Row`/`Col` or `Flex`.
- [x] **Left Panel (Chat & QA Area):**
  - [x] Chat UI with `Input.TextArea` for entering queries.
  - [x] Message bubbles for User and Assistant.
  - [x] Citation indicators (e.g., "[1]") below assistant responses.
- [x] **Right Panel (Retrieval Config & Context Area):**
  - [x] **Config Form:**
    - [x] Top-K slider & input (1-20, default 5).
    - [x] Similarity Threshold slider (0.0 - 1.0).
  - [x] **Retrieved Chunks List:**
    - [x] Render using Ant Design `List` and `Card`.
    - [x] Display Score badge (color-coded: >0.8 green, 0.6-0.8 orange, <0.6 red).
    - [x] Display Source document link.
    - [x] Display truncated chunk content (`Typography.Paragraph` with expandable ellipsis).

### 📦 3. Mock Data Integration
- [x] Create mock chat history data structures.
- [x] Create mock retrieved chunks (`id`, `score`, `document_name`, `content`).

### 🔌 4. API Integration
- [x] Implement `sendAiChat` non-streaming method in API client.
- [x] Connect Playground to `/api/v1/ai/chat` for real testing.
- [ ] TODO: Support test parameters (`knowledgeBaseId`, `topK`, `threshold`) when backend is ready.

---

## 6. Unimplemented Backend API Connections

### P0 (Critical - Demo Chain Dependencies)

#### Doctor Encounters Module
**Status:** API exists in backend, frontend uses mock data only

| Endpoint | Method | Frontend Status | Location |
|---------|--------|----------------|----------|
| `/api/v1/encounters` | GET | ❌ Mock only | `apps/backoffice-web/src/pages/encounters-page.tsx` |
| `/api/v1/encounters/{encounterId}` | GET | ❌ Mock only | `apps/backoffice-web/src/pages/encounter-detail-page.tsx` |
| `/api/v1/encounters/{encounterId}/ai-summary` | GET | ❌ Mock only | `apps/backoffice-web/src/pages/encounter-detail-page.tsx` |

**Tasks:**
- [ ] Add `getEncounters(params)` to `packages/api-client/src/index.ts`
- [ ] Add `getEncounter(encounterId)` to `packages/api-client/src/index.ts`
- [ ] Add `getEncounterAiSummary(encounterId)` to `packages/api-client/src/index.ts`
- [ ] Replace mock data in `encounters-page.tsx` with real API calls
- [ ] Replace mock data in `encounter-detail-page.tsx` with real API calls

#### EMR Module
**Status:** Backend NOT ready (documented but not implemented)

| Endpoint | Method | Backend Status | Frontend Status |
|---------|--------|----------------|-----------------|
| `/api/v1/emr` | POST | ⚠️ Not ready | ❌ Placeholder UI only |
| `/api/v1/emr/{encounterId}` | GET | ⚠️ Not ready | ❌ Placeholder UI only |

**Tasks (when backend ready):**
- [ ] Add `createEmr(data)` to `packages/api-client/src/index.ts`
- [ ] Add `getEmr(encounterId)` to `packages/api-client/src/index.ts`
- [ ] Implement EMR editor form in `apps/backoffice-web/src/pages/emr-page.tsx`
- [ ] Connect form to `createEmr` API

#### Prescription Module
**Status:** Backend NOT ready (documented but not implemented)

| Endpoint | Method | Backend Status | Frontend Status |
|---------|--------|----------------|-----------------|
| `/api/v1/prescriptions` | POST | ⚠️ Not ready | ❌ Placeholder UI only |
| `/api/v1/prescriptions/{encounterId}` | GET | ⚠️ Not ready | ❌ Placeholder UI only |

**Tasks (when backend ready):**
- [ ] Add `createPrescription(data)` to `packages/api-client/src/index.ts`
- [ ] Add `getPrescription(encounterId)` to `packages/api-client/src/index.ts`
- [ ] Implement Prescription editor form in `apps/backoffice-web/src/pages/prescription-page.tsx`
- [ ] Connect form to `createPrescription` API

#### Audit Module
**Status:** Backend NOT ready (documented but not implemented)

| Endpoint | Method | Backend Status | Frontend Status |
|---------|--------|----------------|-----------------|
| `/api/v1/audit/events` | GET | ⚠️ Not ready | ❌ Mock only |
| `/api/v1/audit/data-access` | GET | ⚠️ Not ready | ❌ Mock only |

**Tasks (when backend ready):**
- [ ] Add `getAuditEvents(params)` to `packages/api-client/src/index.ts`
- [ ] Add `getDataAccessLogs(params)` to `packages/api-client/src/index.ts`
- [ ] Replace mock data in `audit-page.tsx` with real API calls

---

### P1 (Important - User Profile & Admin Features)

#### Authentication Module (Additional)
**Status:** API exists in backend, not connected to frontend

| Endpoint | Method | Frontend Status |
|---------|--------|-----------------|
| `/api/v1/auth/refresh` | POST | ❌ Not in API client |
| `/api/v1/auth/logout` | POST | ❌ Not in API client |

**Tasks:**
- [ ] Add `refreshToken(refreshToken)` to `packages/api-client/src/index.ts`
- [ ] Add `logout(refreshToken)` to `packages/api-client/src/index.ts`
- [ ] Implement token refresh logic in auth state management
- [ ] Implement logout functionality (clear session, redirect to login)

#### Patient Profile Module
**Status:** API exists in backend, no UI/UX implemented

| Endpoint | Method | Frontend Status |
|---------|--------|-----------------|
| `/api/v1/patients/me/profile` | GET | ❌ Not connected |
| `/api/v1/patients/me/profile` | PUT | ❌ Not connected |

**Tasks:**
- [ ] Add `getPatientProfile()` to `packages/api-client/src/index.ts`
- [ ] Add `updatePatientProfile(data)` to `packages/api-client/src/index.ts`
- [ ] Create Patient Profile page (`/profile`) in `apps/patient-h5/src/pages/`
- [ ] Implement profile form with fields: gender, birthDate, bloodType, allergySummary
- [ ] Add profile navigation to patient app menu/header

#### Doctor Profile Module
**Status:** API exists in backend, no UI/UX implemented

| Endpoint | Method | Frontend Status |
|---------|--------|-----------------|
| `/api/v1/doctors/me/profile` | GET | ❌ Not connected |
| `/api/v1/doctors/me/profile` | PUT | ❌ Not connected |

**Tasks:**
- [ ] Add `getDoctorProfile()` to `packages/api-client/src/index.ts`
- [ ] Add `updateDoctorProfile(data)` to `packages/api-client/src/index.ts`
- [ ] Create Doctor Profile page (`/profile`) in `apps/backoffice-web/src/pages/`
- [ ] Implement profile form with fields: professionalTitle, introductionMasked
- [ ] Add profile navigation to backoffice app menu

#### Admin Patient Management Module
**Status:** API exists in backend, no UI/UX implemented

| Endpoint | Method | Frontend Status |
|---------|--------|-----------------|
| `/api/v1/admin/patients` | GET | ❌ Not connected |
| `/api/v1/admin/patients/{patientId}` | GET | ❌ Not connected |
| `/api/v1/admin/patients` | POST | ❌ Not connected |
| `/api/v1/admin/patients/{patientId}` | PUT | ❌ Not connected |
| `/api/v1/admin/patients/{patientId}` | DELETE | ❌ Not connected |

**Tasks:**
- [ ] Add `getPatients(params)` to `packages/api-client/src/index.ts`
- [ ] Add `getPatientById(patientId)` to `packages/api-client/src/index.ts`
- [ ] Add `createPatient(data)` to `packages/api-client/src/index.ts`
- [ ] Add `updatePatient(patientId, data)` to `packages/api-client/src/index.ts`
- [ ] Add `deletePatient(patientId)` to `packages/api-client/src/index.ts`
- [ ] Create Patient Management page (`/admin/patients`) in `apps/backoffice-web/src/pages/`
- [ ] Implement patient list table with pagination and search
- [ ] Implement patient detail modal/page
- [ ] Implement create/edit patient forms

---

### P2 (Patient App - Missing Features)

#### AI Consultation Module (Additional)
**Status:** Streaming endpoint exists in backend, not connected

| Endpoint | Method | Frontend Status |
|---------|--------|-----------------|
| `/api/v1/ai/chat/stream` | POST | ❌ Not in API client |
| `/api/v1/ai/sessions/{sessionId}/registration-handoff` | POST | ❌ Not in API client |

**Tasks:**
- [ ] Add `connectAiChatStream(data)` SSE method to `packages/api-client/src/index.ts`
- [ ] Add `getRegistrationHandoff(sessionId)` to `packages/api-client/src/index.ts`
- [ ] Implement SSE stream handling with proper cursor animation
- [ ] Integrate registration handoff data into registration form

#### Registration Module (Completion)
**Status:** Basic endpoints connected, handoff missing

| Endpoint | Method | Frontend Status |
|---------|--------|-----------------|
| `/api/v1/clinic-sessions` | GET | ✓ Connected |
| `/api/v1/registrations` | POST | ✓ Connected |
| `/api/v1/registrations` | GET | ✓ Connected |

**Tasks:**
- [ ] Complete registration flow with AI handoff data pre-filling
- [ ] Add registration detail page for viewing completed registrations
- [ ] Add cancellation functionality for PENDING registrations

---

### P3 (Backoffice - Additional Features)

#### Workbench Module
**Status:** Uses mock data for pending encounters

| Endpoint | Method | Frontend Status |
|---------|--------|-----------------|
| `/api/v1/encounters` | GET (status=SCHEDULED) | ❌ Mock only |

**Tasks:**
- [ ] Replace mock data in `workbench-page.tsx` with real `getEncounters` call
- [ ] Filter by `status=SCHEDULED` for pending encounters

---

## 7. UI/UX Not Yet Implemented

### Patient App (`apps/patient-h5`)

#### Missing Pages
- [ ] **Patient Profile** (`/profile`) - View and edit personal info
- [ ] **Registration Detail** (`/registrations/:id`) - View specific registration details
- [ ] **Settings** (`/settings`) - App settings (notifications, theme, etc.)

#### Missing Components
- [ ] Profile avatar upload/display
- [ ] Form validation with error messages
- [ ] Pull-to-refresh on list pages
- [ ] Empty states for lists (no registrations, no sessions)
- [ ] Loading skeletons for all async operations
- [ ] Error boundary for graceful error handling
- [ ] Toast notifications for actions (success/failure)
- [ ] Bottom navigation bar for easy page switching

#### UX Improvements Needed
- [ ] Add haptic feedback on mobile devices for tap actions
- [ ] Implement swipe gestures for list items (e.g., delete registration)
- [ ] Add offline support for viewing cached data
- [ ] Implement progressive loading for long chat histories
- [ ] Add accessibility features (ARIA labels, keyboard navigation)

---

### Backoffice App (`apps/backoffice-web`)

#### Missing Pages
- [ ] **Doctor Profile** (`/profile`) - View and edit doctor information
- [ ] **Patient Management** (`/admin/patients`) - CRUD operations for patients
- [ ] **Patient Detail** (`/admin/patients/:id`) - View patient details
- [ ] **Department Management** (`/admin/departments`) - Manage departments (if API exists)
- [ ] **User Management** (`/admin/users`) - Manage system users (if API exists)
- [ ] **System Settings** (`/admin/settings`) - App configuration

#### Missing Components
- [ ] Rich text editor for EMR notes
- [ ] Drug search/autocomplete for prescriptions
- [ ] File upload component for medical documents
- [ ] Data table with advanced filtering, sorting, and export
- [ ] Modal dialogs for confirmations and quick actions
- [ ] Form wizard for multi-step processes
- [ ] Dashboard with statistics and charts
- [ ] Activity timeline for audit trails

#### UX Improvements Needed
- [ ] Implement keyboard shortcuts for common actions
- [ ] Add drag-and-drop for list reordering
- [ ] Implement virtual scrolling for large data sets
- [ ] Add print styles for EMR and prescriptions
- [ ] Implement undo/redo for form edits
- [ ] Add help tooltips and documentation links
- [ ] Implement responsive design for tablet devices

---

## 8. Known Issues & Technical Debt

### Security
- [ ] No XSS sanitization for Markdown content (potential security risk)
- [ ] No CSRF protection implemented
- [ ] Sensitive data may be logged in console errors

### Performance
- [ ] No code splitting or lazy loading for routes
- [ ] No image optimization
- [ ] No caching strategy for API responses
- [ ] No debouncing/throttling for search inputs

### Code Quality
- [ ] Mock API file (`src/services/mock/api.ts`) still exists and may be imported
- [ ] Inconsistent error handling across components
- [ ] Missing TypeScript strict mode compliance
- [ ] No E2E tests
- [ ] Limited unit test coverage

### Accessibility
- [ ] Missing ARIA labels on many interactive elements
- [ ] No keyboard navigation support for custom components
- [ ] Color contrast not verified for accessibility standards
- [ ] No screen reader announcements for dynamic content

---

## 9. API Client Status Summary

### Already Implemented ✓
- `login(username, password)` → `POST /api/v1/auth/login`
- `getMe()` → `GET /api/v1/auth/me`
- `sendAiChat(data)` → `POST /api/v1/ai/chat`
- `getAiSessions()` → `GET /api/v1/ai/sessions`
- `getAiSession(sessionId)` → `GET /api/v1/ai/sessions/{sessionId}`
- `getTriageResult(sessionId)` → `GET /api/v1/ai/sessions/{sessionId}/triage-result`
- `getClinicSessions(params)` → `GET /api/v1/clinic-sessions`
- `createRegistration(data)` → `POST /api/v1/registrations`
- `getRegistrations(params)` → `GET /api/v1/registrations`
- `getKnowledgeBases(params)` → `GET /api/v1/admin/knowledge-bases`
- `createKnowledgeBase(data)` → `POST /api/v1/admin/knowledge-bases`
- `updateKnowledgeBase(id, data)` → `PATCH /api/v1/admin/knowledge-bases/{id}`
- `deleteKnowledgeBase(id)` → `DELETE /api/v1/admin/knowledge-bases/{id}`
- `getKnowledgeDocuments(params)` → `GET /api/v1/admin/knowledge-documents`
- `importKnowledgeDocument(formData)` → `POST /api/v1/admin/knowledge-documents/import`
- `deleteKnowledgeDocument(id)` → `DELETE /api/v1/admin/knowledge-documents/{id}`

### Not Yet Implemented ❌
- `refreshToken(refreshToken)` → `POST /api/v1/auth/refresh`
- `logout(refreshToken)` → `POST /api/v1/auth/logout`
- `connectAiChatStream(data)` → `POST /api/v1/ai/chat/stream` (SSE)
- `getRegistrationHandoff(sessionId)` → `POST /api/v1/ai/sessions/{sessionId}/registration-handoff`
- `getPatientProfile()` → `GET /api/v1/patients/me/profile`
- `updatePatientProfile(data)` → `PUT /api/v1/patients/me/profile`
- `getDoctorProfile()` → `GET /api/v1/doctors/me/profile`
- `updateDoctorProfile(data)` → `PUT /api/v1/doctors/me/profile`
- `getEncounters(params)` → `GET /api/v1/encounters`
- `getEncounter(encounterId)` → `GET /api/v1/encounters/{encounterId}`
- `getEncounterAiSummary(encounterId)` → `GET /api/v1/encounters/{encounterId}/ai-summary`
- `createEmr(data)` → `POST /api/v1/emr` (Backend not ready)
- `getEmr(encounterId)` → `GET /api/v1/emr/{encounterId}` (Backend not ready)
- `createPrescription(data)` → `POST /api/v1/prescriptions` (Backend not ready)
- `getPrescription(encounterId)` → `GET /api/v1/prescriptions/{encounterId}` (Backend not ready)
- `getAuditEvents(params)` → `GET /api/v1/audit/events` (Backend not ready)
- `getDataAccessLogs(params)` → `GET /api/v1/audit/data-access` (Backend not ready)
- `getPatients(params)` → `GET /api/v1/admin/patients`
- `getPatientById(patientId)` → `GET /api/v1/admin/patients/{patientId}`
- `createPatient(data)` → `POST /api/v1/admin/patients`
- `updatePatient(patientId, data)` → `PUT /api/v1/admin/patients/{patientId}`
- `deletePatient(patientId)` → `DELETE /api/v1/admin/patients/{patientId}`

---

## 10. Priority Implementation Order

### Phase 1: Complete Demo Chain (P0)
1. Connect Encounters API (encounter list, detail, AI summary)
2. Implement streaming AI chat
3. Connect registration handoff
4. Wait for EMR backend → Implement EMR
5. Wait for Prescription backend → Implement Prescription
6. Wait for Audit backend → Implement Audit

### Phase 2: User Profile & Auth (P1)
1. Implement token refresh and logout
2. Patient Profile page (get/update)
3. Doctor Profile page (get/update)
4. Admin Patient Management (CRUD)

### Phase 3: UI/UX Enhancements (P2-P3)
1. Patient app improvements (skeletons, toasts, empty states)
2. Backoffice app improvements (rich text editor, data tables)
3. Missing pages (settings, about, etc.)
4. Accessibility improvements

### Phase 4: Technical Debt & Security
1. XSS sanitization for Markdown
2. Code splitting and performance optimization
3. Error handling consistency
4. Test coverage
