<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": true` in the root `turbo.json` or `turbo.jsonc` to opt in; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# Mandatory Spec Kit workflow

- Read `PRD.md` and this file completely before feature work.
- Compare every proposed feature with the PRD and identify the affected requirements.
- Use Spec Kit in this order: specify, clarify, plan, checklist, tasks, analyze, implement.
- Use the actual installed CLI or skill names and check their help before assuming syntax.
- Do not silently change product scope in code. Update the PRD when product direction or foundational requirements change.
- Use Ponytail throughout implementation and review.

# Mandatory UI component and Playwright rules

These rules supplement the Spec Kit and Ponytail requirements in this repository.

## Component sourcing

- Read `PRD.md` before every UI task.
- Never invent generic UI primitives.
- Search the approved component sources before implementation.
- Use the shadcn CLI and approved registries wherever possible.
- Inspect component source, dependencies, license and documentation before installation.
- Record every installed component in `docs/UI_COMPONENT_REGISTRY.md`.
- Never claim a component is sourced if it was independently authored.
- Do not install competing component systems without explicit technical justification.
- Prefer existing components over creating replacements.
- Page composition and application-specific business logic are allowed.
- If no appropriate component exists, report the gap and ask for approval before creating a new reusable visual primitive.

## Playwright is mandatory

Before selecting a component:

1. Open its official documentation.
2. Inspect the live demo with Playwright when available.
3. Inspect variants and interactions.
4. Capture a screenshot if useful.
5. Verify compatibility with the installed framework and design system.

After implementing a UI feature:

1. Start the local application.
2. Open it with Playwright.
3. Test the actual user workflow.
4. Check console errors.
5. Check failed network requests.
6. Check keyboard interactions.
7. Check responsive behaviour.
8. Capture screenshots.
9. Fix visible defects.
10. Report the results.

Required viewports:

- 1440 × 900
- 1280 × 800
- 768 × 1024
- 390 × 844

Use semantic locators and deterministic assertions. Avoid arbitrary sleeps.

If Playwright or browser access is unavailable, report the limitation. Never claim a browser test was performed when it was not.

## Documentation

- Follow the official documentation for the exact installed dependency version.
- Do not invent framework APIs.
- Do not use deprecated patterns when the current documentation provides a supported alternative.
- Never modify `node_modules`.
- Maintain `docs/TECHNICAL_SOURCES.md`.
- Verify component registry instructions before configuring them.

## Completion requirements

A UI feature cannot be marked complete until:

- Component sourcing has been documented.
- The implementation passes type checking and linting.
- Relevant automated tests pass.
- Playwright browser verification passes.
- Responsive screenshots have been reviewed.
- Accessibility issues have been addressed.
- Ponytail review has been performed.

Every UI implementation report must include:

| Requirement | Evidence |
| --- | --- |
| Component source | Library and component name |
| Documentation | Official URL |
| Installation | CLI command or package |
| Compatibility | React, Next.js and Tailwind versions |
| Provenance | Entry in `docs/UI_COMPONENT_REGISTRY.md` |
| Browser testing | Playwright test results |
| Visual review | Screenshots at required sizes |
| Accessibility | Test results and known limitations |
