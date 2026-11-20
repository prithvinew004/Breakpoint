# Breakpoint

Breakpoint is a Bun and Turborepo monorepo for an AI-assisted application security and reliability testing platform.

Phase 0 provides repository infrastructure only. Authentication, projects, scanning, AI analysis,
extension behavior, and MCP tools are intentionally not implemented yet.

## Repository structure

```text
apps/
  web/              Next.js application
  api/              Elysia backend
  scanner/          Playwright scanner
  extension/        Future WXT extension boundary
  mcp/              Future MCP server boundary
packages/
  shared/           Shared validation and TypeScript contracts
  database/         Future generated database-contract boundary
  security-rules/   Future scanner-rule boundary
  config/           Shared TypeScript configuration
scripts/            Repository quality and dependency-audit scripts
```

See [PRD.md](./PRD.md) for the product and engineering baseline.

## Prerequisites

- Bun 1.4.4
- Node.js 24 or newer for Playwright
- Chromium installed with `bun run playwright:install`

## Install

```bash
bun install --frozen-lockfile --no-env-file
```

Phase 0 development, tests, browser checks, and production builds do not require Supabase or
database credentials. Do not create an environment file for the baseline workflow.

The optional web-owned Supabase clients validate these public variables when application code uses
them:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Put real local values only in the ignored `apps/web/.env.local` file. Never commit or push an
environment file. The API uses port `3001` by default and needs no environment configuration for
its health route.

## Development

```bash
bun run dev
```

The web application runs at `http://localhost:3000`. The health-only API runs at
`http://localhost:3001/health`.

Run a single workspace with Bun's filter syntax:

```bash
bun run --filter @breakpoint/web dev
bun run --filter @breakpoint/api dev
```

## Quality commands

```bash
bun run audit:dependencies
bun run format:check
bun run lint
bun run check-types
bun run test
bun run test:e2e
bun run build
```

`test:e2e` starts the web application and runs the same smoke scenario in Chromium at 1440×900,
1280×800, 768×1024, and 390×844. The smoke test fails on unexpected browser console errors,
network failures, failed HTTP responses, or horizontal overflow. Screenshots stay in ignored
scanner test output.
