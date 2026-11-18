# BREAKPOINT — Product Requirements Document

**Version:** 2.0
**Status:** Product and engineering baseline
**Product:** Breakpoint
**Canonical product requirements:** This document
**Repository:** Bun + Turborepo monorepo

---

# 1. Product vision

Breakpoint is an AI-assisted application security and reliability testing platform for developers.

A developer connects an application they own or are explicitly authorized to test. Breakpoint discovers its pages and workflows, executes controlled security and reliability tests, verifies suspected findings, explains their impact, and provides actionable remediation guidance.

**Core promise:**

> Find what can break. Understand why it breaks. Fix it. Verify that it is fixed.

The long-term vision is to become an autonomous security and reliability engineer integrated into the software development lifecycle.

# 2. Problem statement

Small software teams frequently lack dedicated application security engineers and comprehensive QA resources.

Applications may contain:

- Incorrect authentication and authorization behaviour.
- Insecure API endpoints.
- Unintended data exposure.
- Unsafe input handling.
- Broken session behaviour.
- Workflow bypasses.
- Unexpected behaviour under unusual inputs.
- Network and state-management failures.
- Regressions introduced by deployments.

Breakpoint makes systematic application testing accessible through a developer-friendly workflow.

# 3. Target customers

## Primary

Independent developers, technical founders and small SaaS teams with approximately 1–15 developers.

## Secondary

- Software development agencies.
- Freelance developers.
- QA engineers.
- Application security consultants.

The initial buyer is a founder, CTO, technical lead or independent developer.

# 4. Product principles

1. Authorization first.
2. Evidence before claims.
3. Reproducibility.
4. Safe by default.
5. Developer-focused remediation.
6. Human control over risky actions.
7. Local-first execution.
8. Privacy by default.
9. Technology-agnostic security rules.
10. No false promises about complete vulnerability detection.
11. Official documentation over assumptions.
12. Existing, sourced UI components over invented UI primitives.

# 5. Product surfaces

## 5.1 Web application

The central application provides:

- Marketing website.
- Authentication.
- Onboarding.
- Dashboard.
- Project management.
- Scan configuration.
- Scan history.
- Findings and remediation reports.
- Integrations.
- Account and team settings.

## 5.2 Chrome extension

The extension:

- Uses Chrome Manifest V3.
- Requests minimum necessary permissions.
- Allows explicit target-origin selection.
- Observes authorized page navigation and relevant network metadata.
- Connects to the local scanner.
- Shows scan status and controls.
- Supports immediate cancellation.

It must not silently monitor unrelated websites or collect unrelated browsing history.

## 5.3 Local scanner

The independent scanner:

- Uses Playwright.
- Discovers pages and workflows.
- Identifies forms and interactive elements.
- Discovers observed API routes.
- Executes controlled tests.
- Collects evidence.
- Verifies suspected findings.
- Produces structured reports.

The initial scanner runtime is Node.js for predictable browser automation compatibility. Bun manages the monorepo and workspace dependencies.

## 5.4 MCP server

Use the official MCP TypeScript SDK and local stdio transport.

Initial clients:

- OpenAI Codex.
- Claude Code.

Initial tools:

- `list_projects`
- `get_project`
- `start_scan`
- `get_scan_status`
- `list_findings`
- `get_finding`
- `get_finding_evidence`
- `generate_remediation`
- `verify_finding_fix`

Every tool must enforce authorization and scan scope. Do not expose unrestricted shell execution or unrestricted browser control.

## 5.5 Backend

The hosted backend provides identity integration, projects, scan metadata, findings, evidence references, settings and optional synchronization.

The initial product must not require hosted browser execution.

# 6. Mandatory technology stack

| Layer | Technology |
|---|---|
| Runtime and package manager | Bun |
| Monorepo | Turborepo |
| Frontend | Next.js App Router |
| UI foundation | shadcn/ui |
| Styling | Tailwind CSS |
| API | Elysia.js |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Database client | Supabase JavaScript SDK |
| Extension | WXT + TypeScript |
| Browser automation | Playwright |
| Scanner runtime | Node.js |
| Agent integration | MCP TypeScript SDK |
| Validation | Zod where appropriate |
| Unit tests | Vitest |
| Browser and E2E tests | Playwright Test |
| Formatting and linting | Biome |
| CI | GitHub Actions |

Use Supabase generated database types. Do not introduce Prisma in the initial version.

Elysia is the primary backend API. Do not duplicate backend business logic in Next.js route handlers.

Do not introduce extra frameworks without a documented requirement.

# 7. Mandatory UI sourcing policy

## 7.1 Absolute rule

**Do not invent or hand-code new UI primitives or reusable visual components when an appropriate component already exists in an approved source.**

Before implementing any UI element, the agent must search the approved component sources and official documentation.

The agent must reuse and install an existing component wherever a suitable implementation exists.

The agent must not create a custom replacement merely because it is faster to write JSX.

Examples of components that must be sourced:

- Buttons.
- Inputs.
- Textareas.
- Selects.
- Comboboxes.
- Dropdown menus.
- Dialogs.
- Alert dialogs.
- Drawers.
- Sheets.
- Popovers.
- Tooltips.
- Tabs.
- Accordions.
- Sidebars.
- Navigation menus.
- Tables.
- Data grids.
- Charts.
- Cards.
- Badges.
- Avatars.
- Progress indicators.
- Skeletons.
- Toasts.
- Command palettes.
- Calendars.
- Date pickers.
- Form controls.
- Pagination.
- Empty states.
- Loading states.
- Error states.
- Animated icons.
- Motion effects.
- Background effects.
- Hero sections.
- Pricing sections.
- Testimonials.
- Marketing sections.

A page-specific composition of existing components is allowed. A new generic visual primitive is not allowed without documented approval.

## 7.2 Approved component and design sources

The agent must search these sources before deciding to build a UI component.

### Component libraries and registries

1. shadcn/ui — https://ui.shadcn.com/
2. TanStack UI — https://tanstack.com/stack/ui
3. 21st.dev — https://dev.21st.dev/
4. Animista — https://animista.net/
5. Magic UI — https://magicui.design/
6. Animate UI — https://animate-ui.com/
7. React Bits — https://reactbits.dev/
8. coss UI — https://coss.com/ui
9. Kibo UI — https://kibo-ui.com/
10. Chakra UI — https://chakra-ui.com/
11. Skiper UI — https://skiper-ui.com/
12. Radix UI — https://www.radix-ui.com/primitives
13. Cult UI — https://www.cult-ui.com/
14. React Components — https://reactcomponents.com/
15. Aceternity UI — https://ui.aceternity.com/

### Design research and visual tools

16. Godly — https://godly.design/
17. Unicorn Studio — https://www.unicorn.studio/
18. Spline — https://spline.design/
19. Design Spells — https://designspells.com/
20. UI/UX Pro Max — verify the official repository and current documentation before installation.
21. Refero — https://refero.design/

The unidentified bookmark named "The Foundation for your De..." must not be used until its exact identity and URL are confirmed.

If a source is unavailable, the agent must report that limitation instead of inventing an alternative URL.

## 7.3 Source classification

Not every approved source is a component library.

The agent must classify sources correctly:

- Component registries provide reusable components and sections.
- Headless libraries provide behaviour, state and accessibility primitives.
- Animation libraries provide animation behaviour and effects.
- Design research sites provide visual and UX references.
- Visual creation tools provide optional visual assets or effects.

Do not attempt to import components from a design inspiration website.

## 7.4 Foundation and compatibility

shadcn/ui is the primary design-system foundation.

Use its CSS variables, theme tokens, component conventions and CLI.

Additional registries must be evaluated for:

- React compatibility.
- Next.js App Router compatibility.
- Tailwind version compatibility.
- React version compatibility.
- Accessibility.
- TypeScript support.
- Dependencies.
- Bundle impact.
- License.
- Commercial usage permissions.
- Maintenance and documentation quality.

Do not install multiple competing primitive systems without a concrete reason.

Radix UI, Base UI and Chakra UI are not automatically interchangeable.

Do not add Chakra UI as a second full design system.

If the selected shadcn configuration uses Radix primitives, use compatible components. If it uses Base UI, verify compatibility with that base.

Animate UI must be configured for the selected primitive base.

coss UI is based on Base UI and must be treated as an alternative or carefully evaluated companion, not assumed to be compatible with every existing primitive.

## 7.5 Component discovery procedure

Before writing a new visual component, the agent must:

1. Identify the UI requirement.
2. Search shadcn/ui.
3. Search the relevant approved registries.
4. Search the official documentation for matching components.
5. Inspect examples, variants, props and dependencies.
6. Compare compatibility with the existing design system.
7. Select the most appropriate source.
8. Install it using the official CLI or installation instructions.
9. Record its source and version.
10. Verify its rendered result with Playwright.

Search results alone do not establish that a component is suitable. The agent must inspect the component itself.

## 7.6 Component provenance

Every installed external component must be traceable to its source.

Maintain:

`docs/UI_COMPONENT_REGISTRY.md`

For each component, record:

- Component name.
- Product area.
- Source library.
- Official component URL.
- Registry identifier or package name.
- Installed version or source revision when available.
- License.
- Dependencies.
- Installation date.
- Whether it was modified locally.
- Reason for selection.

Do not claim that a component came from a library if it was independently authored.

## 7.7 No custom primitives

The agent must not independently author a new generic:

- Button.
- Card.
- Input.
- Modal.
- Dialog.
- Dropdown.
- Select.
- Tooltip.
- Table.
- Sidebar.
- Navigation system.
- Chart.
- Form control.
- Toast.
- Animation primitive.

If no suitable component exists in the approved sources:

1. Search all applicable sources.
2. Search official framework and primitive documentation.
3. Report the missing component.
4. Present the closest existing alternatives.
5. Ask for approval before creating a new reusable UI primitive.

This policy does not prohibit page composition, application-specific business logic, hooks, API integration, data transformations or domain-specific layout composition.

## 7.8 No unnecessary copying

Use official registry installation mechanisms wherever possible.

Do not copy entire libraries or large collections into the repository.

Only install the components actually required.

Review the source and dependencies before accepting generated component files.

# 8. Mandatory browser research and Playwright workflow

Playwright is mandatory for browser-based component inspection and product verification.

## 8.1 Component research

When a component is needed, the agent should use Playwright to:

- Open the official component documentation.
- Inspect the component examples.
- Inspect available variants.
- Inspect responsive behaviour.
- Inspect interactions.
- Inspect accessibility-related behaviour where observable.
- Capture screenshots of relevant examples.
- Compare candidate components where necessary.

The agent must use the official documentation as the authority for API usage.

Playwright inspection does not replace reading documentation.

The agent must not assume that a screenshot reveals the full component API.

## 8.2 Product implementation verification

After implementing a UI feature, Playwright must:

- Open the actual local application.
- Test the implemented workflow.
- Check interactive elements.
- Check navigation.
- Check loading and empty states.
- Check error states.
- Check keyboard interactions where applicable.
- Test responsive layouts.
- Capture screenshots.
- Report console errors and failed network requests.
- Check for visible overflow and layout defects.

## 8.3 Viewports

At minimum, verify:

- Desktop: 1440 × 900.
- Laptop: 1280 × 800.
- Tablet: 768 × 1024.
- Mobile: 390 × 844.

Use additional viewports when the feature requires them.

## 8.4 Visual regression

Use deterministic screenshots and Playwright screenshot comparisons for important product screens.

Avoid brittle tests based on arbitrary timeouts.

Prefer accessible roles, labels, text and stable test identifiers.

Respect reduced-motion preferences in tests and implementation.

## 8.5 Browser safety

When browsing component sites, restrict activity to the documentation and demo pages.

Never enter real credentials into third-party demos.

Do not install or execute untrusted scripts merely to inspect a component.

# 9. Documentation-first engineering

Official technical documentation is mandatory.

The product requirements are defined by this PRD. Technical APIs and implementation details are defined by the official documentation for the exact installed versions.

Authoritative sources include:

- Next.js: https://nextjs.org/docs
- React: https://react.dev/
- Bun: https://bun.sh/docs
- Turborepo: https://turborepo.dev/docs
- Elysia: https://elysiajs.com/
- Supabase: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Playwright: https://playwright.dev/docs/intro
- WXT: https://wxt.dev/
- Chrome Extensions: https://developer.chrome.com/docs/extensions
- MCP: https://modelcontextprotocol.io/
- OWASP WSTG: https://owasp.org/www-project-web-security-testing-guide/
- OWASP ASVS: https://asvs.owasp.org/

Before using a framework or library API:

1. Identify the installed version.
2. Read the relevant official documentation.
3. Inspect version-specific documentation shipped with the dependency when available.
4. Verify the exact API and supported configuration.
5. Implement according to that version.
6. Add or update tests.

If Next.js includes agent-oriented documentation under its installed package, inspect the actual installed path. Do not assume the path exists in every release.

Never edit `node_modules`.

Never copy entire documentation sites into the repository.

Maintain `docs/TECHNICAL_SOURCES.md` with relevant documentation links and versions.

# 10. Core application workflow

1. User registers.
2. User creates a project.
3. User configures an authorized application origin.
4. User verifies authorization.
5. User connects the extension.
6. User configures a scan.
7. Scanner discovers application routes and workflows.
8. Scanner generates applicable tests.
9. Scanner executes permitted tests.
10. Suspected findings are verified.
11. Findings are grouped and prioritized.
12. Developer inspects evidence and reproduction steps.
13. Developer reviews remediation guidance.
14. Developer fixes the application.
15. Breakpoint retests the finding.
16. The result is updated.

Possible statuses:

- Not tested.
- Passed.
- Suspected.
- Verified finding.
- Needs manual review.
- Unable to verify.
- Fixed and retested.

# 11. Security testing engine

Initial categories:

## Authentication

- Access to protected pages without authentication.
- Session expiration behaviour.
- Logout invalidation.
- Unauthenticated API requests.
- Session configuration.

## Authorization

- Cross-account access using explicitly configured test accounts.
- Missing server-side permission checks.
- Role boundary violations.
- Insecure direct object reference patterns.
- Restricted operation access.

## Input handling

- Unsafe reflection of untrusted input.
- Controlled injection indicators.
- Unsafe HTML rendering.
- Unexpected input types.
- Boundary values.
- Missing validation.

## API security

- Missing authentication.
- Missing authorization.
- Excessive data exposure.
- Unexpected HTTP methods.
- Unsafe parameter handling.
- Improper error responses.

## Security configuration

- Missing or unsafe security headers.
- Insecure cookie attributes.
- Unnecessary public endpoints.
- Accidental exposure of sensitive configuration.
- Unsafe cross-origin configuration.

## File uploads

Later checks may cover:

- Missing size limits.
- Incorrect file type validation.
- Unsafe filename handling.
- Incorrect upload authorization.
- Public exposure of uploaded resources.

Tests must use controlled, non-destructive payloads.

# 12. Reliability and edge-case testing

Initial categories:

## Forms

- Empty inputs.
- Invalid formats.
- Boundary values.
- Long strings within safe limits.
- Unexpected input types.
- Repeated submissions.
- Missing required values.

## Navigation and state

- Refreshing nested routes.
- Browser back and forward behaviour.
- Stale client state.
- Expired sessions.
- Repeated actions.
- Incomplete workflows.

## Network

- Failed API responses.
- Timeouts.
- Slow responses.
- Offline transitions.
- Duplicate requests.
- Retry behaviour.

## User roles

- Explicitly configured test roles.
- Restricted UI visibility.
- Server-side permission enforcement.
- Inconsistent role state.

## Responsive behaviour

- Small viewport widths.
- Desktop layouts.
- Mobile navigation.
- Layout overflow.
- Essential interaction accessibility.

Keep reliability and security findings separate.

# 13. Authorization and safety

Every scan must have an explicit authorization boundary.

Required settings:

- Project.
- Authorized base URL.
- Allowed origins.
- Environment.
- Authentication profile.
- Test accounts.
- Scan categories.
- Scan intensity.
- Request limits.
- Timeouts.
- Maximum duration.
- Permitted actions.
- Emergency stop.

Default policy:

- Prefer local and staging environments.
- Disable production scanning by default.
- Require origin allowlisting.
- Do not perform destructive tests.
- Do not perform denial-of-service tests.
- Do not perform brute-force tests.
- Do not perform uncontrolled crawling.
- Do not access third-party targets.
- Do not make real payments.
- Do not send real customer emails.
- Do not modify or delete real customer data.

Stop if authorization or scope cannot be established.

# 14. Finding model

Required fields:

- Finding ID.
- Project ID.
- Scan ID.
- Title.
- Category.
- Severity.
- Confidence.
- Verification status.
- Affected page or endpoint.
- Description.
- Impact.
- Reproduction steps.
- Evidence references.
- Recommended remediation.
- Relevant standard or documentation reference.
- First detected timestamp.
- Last detected timestamp.
- Retest status.

Severity:

- Critical.
- High.
- Medium.
- Low.
- Informational.

Confidence:

- High.
- Medium.
- Low.

Never conflate severity and confidence.

An LLM's opinion alone cannot verify a finding.

# 15. Evidence and reporting

Evidence may include:

- Redacted request and response metadata.
- Page and route information.
- Relevant console messages.
- Screenshots.
- Reproduction steps.
- Test identifiers.
- Verification outcomes.

Never store raw passwords, access tokens or session cookies in findings.

Use access controls and retention policies for stored evidence.

# 16. AI analysis and remediation

AI is an assistant to deterministic testing, not the source of truth.

AI may:

- Suggest test ideas.
- Explain verified findings.
- Summarize application behaviour.
- Map findings to security guidance.
- Suggest code changes.
- Explain root causes.
- Generate regression-test suggestions.
- Help coding agents inspect reports.

AI must not:

- Mark unverified issues as verified.
- Invent evidence.
- Execute unrestricted commands.
- Expand scan scope.
- Disable safety controls.
- Apply code changes without developer approval.

The core scanner must work without a hosted LLM API.

Prefer customer-owned coding-agent subscriptions through MCP.

# 17. Dashboard and design requirements

The dashboard must feel like a premium developer-security product.

It must use the approved UI sourcing policy in Section 7.

Required sections:

- Overview.
- Projects.
- Scans.
- Findings.
- Integrations.
- Settings.

The overview should show:

- Total projects.
- Scans completed.
- Open verified findings.
- Critical and high-severity findings.
- Recent scans.
- Recent activity.
- Scanner connection status.

Never display invented statistics or fake live data.

Every interactive control must work.

Every page must have suitable loading, empty, error and success states.

Design quality requirements:

- Consistent typography.
- Clear hierarchy.
- Deliberate spacing.
- Restrained colours.
- Excellent dark and light themes.
- Responsive layouts.
- Accessibility.
- Useful tables and filters.
- Clear severity indicators.
- Motion only where it improves comprehension.
- No decorative clutter.

# 18. Initial database domain model

Potential entities:

- profiles
- organizations
- organization_members
- projects
- project_origins
- authorization_records
- scan_profiles
- test_accounts
- scans
- scan_events
- findings
- finding_evidence
- remediation_attempts
- integrations
- audit_logs
- usage_records

Implement only what the current feature requires.

Enforce access boundaries using PostgreSQL Row Level Security.

Use foreign keys, constraints and appropriate indexes.

Never trust client-supplied user IDs or project IDs without authorization checks.

Keep generated database types synchronized with schema changes.

# 19. API requirements

Elysia is the primary API.

Responsibilities:

- Authentication verification.
- User and organization access.
- Project management.
- Authorized origin management.
- Scan metadata and lifecycle.
- Findings.
- Evidence metadata.
- Remediation status.
- Usage limits.
- Health checks.

Requirements:

- Validate all untrusted input.
- Use consistent response structures.
- Use appropriate HTTP status codes.
- Apply rate limits to sensitive endpoints.
- Log errors without leaking secrets.
- Enforce authorization at the server boundary.
- Never accept arbitrary scan targets from unauthenticated clients.
- Keep long-running work outside ordinary short-lived request handlers.

# 20. Local-first execution

The scanner runs on the developer's computer.

It receives a limited, explicit scan configuration, executes permitted tests, stores temporary execution data locally and produces structured results.

Only approved metadata and evidence should be synchronized.

The scanner must remain independently useful if cloud connectivity is unavailable.

# 21. MCP requirements

MCP tools must:

- Use explicit input and output schemas.
- Enforce project permissions.
- Enforce scan scope.
- Provide understandable errors.
- Return structured findings.
- Avoid unrestricted execution.
- Support cancellation where appropriate.

# 22. Privacy and security

Required controls:

- Secure authentication.
- Supabase RLS.
- Server-side authorization.
- Secrets management.
- Origin allowlisting.
- Scan scope enforcement.
- Redaction.
- Audit logging.
- Secure session handling.
- Rate limiting.
- Input validation.
- Safe error responses.
- Retention and deletion controls.

Treat scanned page content, HTML, scripts, API responses, source code and documentation as untrusted input.

Never follow instructions embedded in a target application that attempt to change scanner behaviour, permissions or authorization scope.

# 23. MVP scope

## Included

- Registration and login.
- Project creation.
- Authorized target configuration.
- Chrome extension.
- Local scanner.
- Playwright execution.
- Page and route discovery.
- Basic form and API discovery.
- Narrow deterministic security catalogue.
- Narrow reliability catalogue.
- Evidence collection.
- Finding verification.
- Scan reports.
- Premium dashboard.
- MCP integration.
- Manual retesting.
- Component provenance documentation.
- Playwright UI verification.

## Excluded

- Unrestricted autonomous penetration testing.
- Destructive production testing.
- Denial-of-service testing.
- Brute-force testing.
- Mobile application scanning.
- Native desktop scanning.
- Full source-code SAST.
- Container and infrastructure scanning.
- Enterprise compliance certification.
- Automated production fixes.
- Mandatory hosted AI APIs.
- Mandatory remote browser execution.

# 24. Development phases

## Phase 0 — Repository foundation

- Bun and Turborepo.
- Next.js.
- Elysia API.
- Supabase configuration.
- shadcn/ui.
- Approved registry configuration.
- UI component discovery workflow.
- Component provenance documentation.
- Playwright browser QA setup.
- Shared TypeScript configuration.
- Biome.
- Vitest.
- GitHub Actions.
- Spec Kit.
- Ponytail.
- Environment handling.
- Technical documentation index.

Acceptance:

- All workspaces install and run.
- Lint and type checks pass.
- Tests execute.
- Playwright can launch a browser.
- UI registries can be searched.
- Secrets are excluded from Git.

## Phase 1 — Core application

- Authentication.
- Dashboard shell.
- Projects.
- Authorized origins.
- Database migrations.
- RLS policies.
- API authentication.

Acceptance:

- Users can register and sign in.
- Users can create projects.
- Users cannot access other users' projects.
- Playwright verifies the key workflows and responsive layouts.

## Phase 2 — Local scanner

- Scanner workspace.
- Playwright.
- Scan configuration.
- Origin enforcement.
- Application discovery.
- Structured results.

Acceptance:

- Scanner runs locally.
- Scanner refuses unapproved targets.
- Scanner discovers routes in a test application.
- Scanner respects limits and cancellation.

## Phase 3 — Security and reliability tests

- Initial security rules.
- Initial reliability rules.
- Evidence collection.
- Finding verification.
- Severity and confidence.

Acceptance:

- Deterministic tests.
- Reproducible evidence.
- Explicit false-positive handling.
- Separate security and reliability results.

## Phase 4 — Extension

- Installation.
- Permission flow.
- Origin selection.
- Browser context.
- Local scanner communication.
- Scan controls.

Acceptance:

- Only authorized origins are accessed.
- User can stop scanning.
- Unrelated browsing data is not collected.

## Phase 5 — MCP

- MCP server.
- Tool schemas.
- Project discovery.
- Scan initiation.
- Finding retrieval.
- Remediation support.
- Retesting.

Acceptance:

- Codex can interact with an authorized project.
- Every tool enforces scope.
- No unrestricted execution.

## Phase 6 — Beta

- Real developer testing.
- False-positive reduction.
- Performance.
- Reporting.
- Privacy controls.
- Onboarding.

Acceptance:

- Developers complete the full scan workflow.
- Findings are useful and reproducible.
- Early users demonstrate repeat usage and willingness to pay.

# 25. Testing requirements

Tests are mandatory.

Required:

- Unit tests.
- API integration tests.
- Database authorization tests.
- Scanner rule tests.
- Extension tests.
- End-to-end tests.
- Security boundary tests.
- Playwright visual and responsive tests.

Use deterministic test data.

Create an intentionally vulnerable local demo application.

Every security rule should have positive and negative test cases where practical.

# 26. Quality and engineering standards

- TypeScript strict mode.
- Avoid `any` unless justified.
- Validate all untrusted input.
- Prefer Server Components in Next.js.
- Use Client Components only when required.
- Avoid unnecessary client-side JavaScript.
- Avoid duplicate dependencies.
- Use accessible selectors in Playwright.
- No arbitrary sleeps in browser tests.
- No dead controls.
- No fake data presented as real.
- No silent errors.
- No unreviewed security-sensitive changes.
- No custom generic UI primitives without approval.
- No undocumented dependency or framework choices.

# 27. Business model

Potential tiers:

## Free

- One project.
- Limited scans.
- Basic rules.
- Limited history.
- Local scanner.
- Basic MCP integration.

## Pro

- More projects.
- More scans.
- Advanced rules.
- Extended history.
- AI remediation assistance.
- Retesting and reporting.

## Team

- Shared projects.
- Team members.
- GitHub integration.
- CI workflows.
- Scheduled scans.
- Shared findings.

## Business

- Higher limits.
- Custom retention.
- Organization controls.
- Advanced integrations.
- Deployment options.

Pricing and usage limits must remain configurable.

Validate willingness to pay before implementing complex billing.

# 28. Success metrics

Track:

- Project activation.
- Scan completion.
- Time to first useful finding.
- Verified findings per scan.
- False-positive rate.
- Reproducible evidence rate.
- Remediation acceptance.
- Retest completion.
- Weekly active projects.
- Repeat scans.
- Free-to-paid conversion.
- Retention.

Do not optimize for raw vulnerability counts.

# 29. Non-goals

- Generic AI chatbot.
- Generic website monitoring tool.
- Full replacement for professional penetration testing.
- Claims of complete vulnerability discovery.
- Unauthorized scanning.
- Mandatory paid AI APIs.
- Unnecessary infrastructure.
- Over-engineering.
- Custom UI primitives when suitable sourced components exist.

# 30. Requirements change management

This PRD is the canonical source of product requirements.

For every proposed feature:

1. Compare it against this PRD.
2. Identify affected requirements.
3. Use Spec Kit to specify the change.
4. Clarify unresolved questions.
5. Update this PRD when product direction or foundational requirements change.
6. Generate a plan and tasks.
7. Analyze the artifacts.
8. Implement only after the workflow permits it.

Do not silently change product scope in code.

# 31. Definition of a successful MVP

A developer can:

1. Create an account.
2. Create an application project.
3. Explicitly authorize a target.
4. Connect the extension.
5. Run a local scan.
6. Discover routes and workflows.
7. Execute controlled security and reliability tests.
8. Receive verified findings with evidence.
9. Understand the risks and fixes.
10. Use Codex through MCP to inspect a finding.
11. Apply a fix with approval.
12. Retest and verify the result.

Breakpoint should behave like a careful, evidence-driven security engineer: explore only what it is authorized to explore, test only what it is permitted to test, report only what it can substantiate, and help developers verify their fixes.
