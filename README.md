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
  shared/           Shared code and types
  database/         Database access
  security-rules/   Scanner security rules
  config/           Shared repository configuration
docs/               Technical and UI research documentation
specs/              Product specifications
.specify/           Specify project state
```

See [PRD.md](./PRD.md) for the product and engineering baseline.

## Prerequisites

- Bun 1.4.4
- Node.js 24 or newer for Playwright
- Chromium installed with `bun run playwright:install`

## Install

```bash
bun install --frozen-lockfile
```

Copy `.env.example` to a local ignored environment file only when a service needs it. The API and
quality checks do not require Supabase credentials.

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
bun run format:check
bun run lint
bun run check-types
bun run test
bun run test:e2e
bun run build
```

`test:e2e` starts the web application and runs the same smoke scenario in Chromium at 1440×900,
1280×800, 390×844, and 393×852. Screenshots stay in ignored scanner test output.

## Documentation

- [Technical sources](./docs/TECHNICAL_SOURCES.md)
- [UI component registry](./docs/UI_COMPONENT_REGISTRY.md)
- [Phase 0 specification](./specs/001-repository-foundation/spec.md)
- [Phase 0 validation guide](./specs/001-repository-foundation/quickstart.md)
