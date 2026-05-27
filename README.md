# Vindicta

Vindicta is a local-first security workspace for scanning projects, tracking vulnerability findings, and exporting security review reports. The desktop app stores project state in each project folder, reads the local codebase, and uses the Codex CLI for read-only security analysis.

## What It Does

- Registers local projects and keeps per-project state in `vindicta.json`.
- Runs AI vulnerability scans with structured findings, evidence, severity, and recommendations.
- Automatically runs a quick scan when a project has no recent security scan.
- Tracks remediation items as first-class security findings.
- Inspects dependency manifests, likely secret patterns, and security-relevant configuration signals.
- Exports professional DOCX security review reports.
- Provides a local Settings contact form that can submit GitHub Issues when a repo-scoped token is configured.

## Monorepo Layout

```text
apps/
  desktop/   Nuxt 4 + Tauri 2 desktop app
  api/       NestJS API prototype with TypeORM/Postgres modules
  landing/   Nuxt landing page
schema/
  v8.json    JSON schema for per-project vindicta.json files
```

## Desktop App

The desktop app is built with Nuxt 4, Vue 3, Pinia, Tailwind CSS, lucide icons, and Tauri 2. It is intentionally local-first:

- app preferences are stored through the Tauri Store plugin with localStorage fallback
- project data lives in the selected project folder as `vindicta.json`
- filesystem, dialog, shell, and store access are controlled by Tauri capabilities
- Codex CLI is launched through Tauri shell allowlisted commands

Primary project tabs are Overview, Scanner, Findings, Dependencies, Secrets, Reports, History, and Settings.

## AI Workflow

Vindicta calls Codex through `apps/desktop/app/composables/useCodexShell.ts`.

The app runs Codex in a `read-only` sandbox for security analysis. Codex private chain-of-thought is not exposed; Vindicta shows user-facing activity logs, structured reports, findings, evidence, and recommendations returned by Codex.

## Project Data

Each managed project uses `vindicta.json` schema version 8. It stores:

- project metadata and active AI tool
- legacy project data for compatibility
- security findings
- scan history
- security workspace settings
- history events

The source TypeScript shape is in `apps/desktop/app/types/vindicta.ts`; the JSON Schema is in `schema/v8.json`.

## Development

Install dependencies:

```bash
pnpm install
```

Run the desktop app in a browser shell:

```bash
pnpm --filter @vindicta/desktop dev
```

Run the Tauri desktop app:

```bash
pnpm app:dev
```

Build the desktop frontend:

```bash
pnpm --filter @vindicta/desktop build
```

Build the Tauri desktop app:

```bash
pnpm --filter @vindicta/desktop tauri:build
```

## Notes For Contributors

- Prefer local project data and existing stores/composables over new global state.
- Keep Tauri shell commands allowlisted and narrow.
- Do not embed production secrets in source or bundled app assets.
- Generated artifacts such as Nuxt output, Tauri targets, and API `dist` files should not be hand-edited.
- When changing Codex prompts, keep outputs structured and user-facing; do not ask for private chain-of-thought.
