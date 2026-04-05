# Repository Instructions

## Package Manager

Use `pnpm` instead of `npm`

## Dependency And Lockfile Policy

- The agent must not modify `pnpm-lock.yaml` unless the user explicitly asked for dependency installation or lockfile refresh.
- If a change to workspace manifests causes `pnpm-lock.yaml` to change, the agent must mention that change explicitly in the final response.
- The agent must treat any third-party package addition, version change, registry change, tarball URL change, integrity change, or install script change as supply-chain relevant and call it out explicitly.
- The agent must distinguish workspace-internal dependency changes from third-party dependency changes in review output.
- The agent must not claim supply-chain review is complete if `package.json` or `pnpm-lock.yaml` changed without being inspected.

## UI/UX Guidelines

- When working on UI/UX related code, the agent MUST consult `docs/docs/08A-DESIGN_GUIDELINES.md` to ensure adherence to the project's design philosophy and best practices.

## Security Guidelines

- **SVG Icon Security**: When using inline SVG icons, the agent must strictly guard against security vulnerabilities (such as XSS). The agent must only use static, hardcoded SVG paths from trusted open-source libraries (e.g., Heroicons, Lucide). The agent MUST NEVER use `dangerouslySetInnerHTML` to render unverified, user-uploaded, or dynamically fetched external SVG strings.
