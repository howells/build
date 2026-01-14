---
name: build
description: Stack-specific knowledge for bootstrapping and shipping Next.js projects. Use when starting new projects, preparing for production, or checking dependency versions.
---

<essential_principles>
**This is opinionated.** These are Daniel's preferred tools and patterns for Next.js projects. Adapt as needed.

**Stack philosophy:**
- Next.js App Router + React 19 + TypeScript
- Tailwind v4 (config-free)
- Drizzle ORM + Neon (serverless Postgres)
- Clerk for auth
- Biome for linting (no ESLint/Prettier)
- Vitest + Playwright for testing

**Canonical code:** No backward compatibility layers. The current code IS the way.
</essential_principles>

<intake>
What do you need?

1. **New project** — Bootstrap a new project with the standard stack
2. **Production checklist** — Pre-launch requirements (SEO, metadata, analytics)
3. **Check versions** — Verify dependencies are current
4. **Stack reference** — Quick lookup of preferred tools/versions

**Wait for response before proceeding.**
</intake>

<routing>
| Response | Workflow |
|----------|----------|
| 1, "new", "bootstrap", "start" | `workflows/new-project.md` |
| 2, "production", "launch", "ship", "deploy" | `workflows/production-checklist.md` |
| 3, "versions", "dependencies", "update" | `workflows/check-versions.md` |
| 4, "stack", "reference", "tools" | Show `references/stack-overview.md` |

**Intent-based routing:**
- User starting fresh project → `workflows/new-project.md`
- User preparing to launch → `workflows/production-checklist.md`
- User asks about versions → `workflows/check-versions.md`
</routing>

<reference_index>
All domain knowledge in `references/`:

- [stack-overview.md](references/stack-overview.md) — Preferred tools and versions (Jan 2025)
- [new-project-checklist.md](references/new-project-checklist.md) — Bootstrap guide
- [production-checklist.md](references/production-checklist.md) — Pre-launch requirements

**Related skills in this plugin:**
- `frontend-design` — Bold aesthetic direction for UI work

**Companion plugin (install separately):**
- `github:howells/ideate` — Design-first workflow with collaborative dialogue and implementation planning
</reference_index>
