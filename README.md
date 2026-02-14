# satty001

## Running tests and checks

- **Pre-completion check (typecheck, lint, unit tests):** `npm run check`
- **E2E tests (Playwright):** `npm run test:e2e` or `npx playwright test`
- **Unit tests only:** `npm run test:unit`

To mirror CI locally: run `npm run check` then `npm run test:e2e`. BMad workflows run inside Cursor (e.g. `/bmad-help`), not from the terminal.

Full command-line reference and Playwright variants: [docs/runbooks/local-checks.md](docs/runbooks/local-checks.md).
