# Local checks and command-line reference

How to run tests, checks, and what runs where (CLI vs Cursor).

## Command line (terminal)

Run these from the repo root. All require Node/npm.

| Purpose | Command |
|--------|---------|
| **E2E tests (Playwright)** | `npm run test:e2e` or `npx playwright test` |
| **Unit tests** | `npm run test:unit` (Vitest) |
| **Full pre-completion check** (per [.cursor/rules/00-operating-system.mdc](../../.cursor/rules/00-operating-system.mdc)) | `npm run check` (typecheck + lint + unit tests; does *not* run Playwright) |
| **Typecheck** | `npm run typecheck` |
| **Lint** | `npm run lint` |
| **Format** | `npm run format` |

### Playwright variants

After `npx playwright install` if needed:

- `npx playwright test e2e/smoke.spec.ts` — run one spec
- `npx playwright test --project=chromium` — one browser
- `npx playwright test --headed` — see the browser
- `npx playwright show-report` — open last HTML report

### Mirroring CI locally

[.github/workflows/ci.yml](../../.github/workflows/ci.yml) runs: `npm ci` → `npm run check` → `npx playwright test`.

To mirror locally: run `npm run check` then `npm run test:e2e`.

---

## BMad (not a CLI)

BMad does not have a command-line entry point in this repo. It is Cursor-integrated:

- **Where it runs:** Inside Cursor (chat or command palette).
- **How to run it:** Use slash commands in chat (e.g. `/bmad-help`, `/bmad-brainstorming`, `/bmad-agent-bmad-master`) or run the matching Cursor commands (e.g. "BMad Help", "BMad Brainstorming"). The BMad Master agent and workflows are driven by the AI reading files under `_bmad/` and following the agent/task definitions.

Summary:

- **Playwright and other checks:** use the command line commands above.
- **BMad:** use Cursor (chat or commands), not the terminal.
