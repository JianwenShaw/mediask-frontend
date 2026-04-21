# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mediask Frontend is a monorepo for an intelligent medical triage and registration system. It provides:
- **patient-h5**: Mobile-optimized patient interface (WeChat H5)
- **backoffice-web**: Administrative interface for doctors and staff

## Commands

```bash
# Development
pnpm dev                # Run patient-h5 (default)
pnpm dev:patient        # Patient app
pnpm dev:backoffice     # Backoffice app (port 5174)

# Build
pnpm build              # Build both apps
pnpm build:patient      # Build patient-h5
pnpm build:backoffice   # Build backoffice-web

# Preview production builds
pnpm preview:patient
pnpm preview:backoffice

# Type checking
pnpm typecheck          # Check all TypeScript projects
```

## Architecture

```
mediask-frontend/
├── apps/
│   ├── patient-h5/       # React 19 + Tailwind (mobile H5)
│   └── backoffice-web/   # React 19 + Ant Design 6 + Tailwind
├── packages/
│   ├── shared-types/     # All TypeScript interfaces (API contracts)
│   └── api-client/       # Type-safe HTTP client with auth interceptors
└── docs/                 # Project documentation
```

### Tech Stack
- **Framework**: React 19 + TypeScript
- **Router**: React Router v7
- **Build**: Vite
- **Styling**: Tailwind CSS v4; Ant Design 6 (backoffice only)
- **State**: Zustand
- **Package Manager**: pnpm workspaces

### API Integration
- Both apps connect to `VITE_API_BASE_URL` (default: `http://localhost:8989`)
- API client handles JWT tokens automatically via interceptors
- Supports streaming responses for AI chat (SSE)

### Shared Packages
- **shared-types**: Source of truth for all API contracts. Includes authentication, AI triage (with RAG citations), medical workflows (appointments, encounters, registrations), and knowledge base types.
- **api-client**: Thin wrapper around native fetch with auth handling. All endpoints are typed from shared-types.

## Key Patterns

### RBAC Roles
- `PATIENT`: AI pre-triage, appointments, view own records
- `DOCTOR`: View schedules, consultations, EMR management, prescriptions
- `ADMIN`: Hospital/department/doctor management, knowledge base, audit logs

### AI Triage Flow
1. Multi-turn patient conversation (streaming SSE)
2. Risk level assessment (low/medium/high)
3. Department recommendation
4. RAG-based responses with citations
5. Generates summary for doctor review

### Type Safety
- All API contracts defined in `packages/shared-types`
- Import from `@mediask/shared-types` across apps
- API client is fully typed against shared-types

## Package Manager

Use `pnpm` instead of `npm`.

## Dependency And Lockfile Policy

- Do not modify `pnpm-lock.yaml` unless explicitly asked for dependency installation or lockfile refresh.
- If workspace manifest changes cause `pnpm-lock.yaml` to change, mention it explicitly.
- Treat any third-party package addition, version change, registry change, tarball URL change, integrity change, or install script change as supply-chain relevant and call it out explicitly.
- Distinguish workspace-internal dependency changes from third-party dependency changes.
- Do not claim supply-chain review is complete if `package.json` or `pnpm-lock.yaml` changed without inspection.

## UI/UX Guidelines

When working on UI/UX code, consult `docs/docs/08A-DESIGN_GUIDELINES.md` to ensure adherence to the project's design philosophy.

## Security Guidelines

- **SVG Icon Security**: Only use static, hardcoded SVG paths from trusted open-source libraries (e.g., Heroicons, Lucide). NEVER use `dangerouslySetInnerHTML` to render unverified, user-uploaded, or dynamically fetched external SVG strings.
