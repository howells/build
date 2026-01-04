# Build

A complete reference for building modern web applications with Next.js, React, TypeScript, and the tools that work best together.

## What This Is

Two complementary layers:

| Layer | Purpose | When to Use |
|-------|---------|-------------|
| **Docs** (this site) | Reference material, setup guides, integration patterns | Starting a new project or setting up a tool |
| **Rules** (`rules/`) | AI agent coding rules via [Ruler](./ruler.md) | Copy to `.ruler/` in any project → generates CLAUDE.md |

The docs teach *how to set things up*. The rules tell AI agents *how to write code* following these conventions.

---

## Quick Reference

### Mandatory Versions (New Projects)

| Package | Minimum | Why |
|---------|---------|-----|
| next | **16.0.0** | Turbopack stable, async params/headers |
| react | **19.0.0** | ref-as-prop, use() hook, no forwardRef |
| typescript | **5.8.0** | Improved inference |
| tailwindcss | **4.0.0** | Config-free, CSS-first |
| zod | **4.0.0** | Breaking inference changes |
| node | **20.9.0** | Required for Next.js 16 |

See [version-requirements.md](./version-requirements.md) for breaking changes and upgrade paths.

### Current Stack (Jan 2026)

```
Next.js 16.x + React 19.x + TypeScript 5.9.x
Tailwind v4 + PostCSS
Biome + Ultracite (formatting/linting)
Drizzle ORM + Neon (PostgreSQL)
Clerk (auth) + tRPC (API)
TanStack Query (data fetching)
Playwright (E2E) + Vitest (unit)
pnpm + Turborepo (monorepos)
```

---

## Documentation

### Project Setup

| File | Purpose |
|------|---------|
| [new-project-checklist.md](./new-project-checklist.md) | Bootstrap a new project step-by-step |
| [production-checklist.md](./production-checklist.md) | Pre-launch: SEO, analytics, deployment |
| [project-structure.md](./project-structure.md) | Monorepo vs single-app patterns |

### Reference

| File | Purpose |
|------|---------|
| [version-requirements.md](./version-requirements.md) | Mandatory versions + breaking changes |
| [stack-overview.md](./stack-overview.md) | Complete tech stack with versions |
| [dependencies.md](./dependencies.md) | All dependencies by category |
| [scripts.md](./scripts.md) | Standard npm scripts |

### Integration Guides

How to set up and use specific tools:

| File | Purpose |
|------|---------|
| [clerk-auth.md](./integrations/clerk-auth.md) | Authentication |
| [drizzle-neon.md](./integrations/drizzle-neon.md) | Database ORM + serverless PostgreSQL |
| [trpc.md](./integrations/trpc.md) | Type-safe APIs |
| [env-validation.md](./integrations/env-validation.md) | Type-safe env vars (Zod, not t3-env) |
| [zustand.md](./integrations/zustand.md) | State management (when to use vs Context) |
| [forms.md](./integrations/forms.md) | Form handling (native, react-hook-form, Zod) |
| [resend-email.md](./integrations/resend-email.md) | Transactional email |
| [openrouter.md](./integrations/openrouter.md) | Multi-model AI |
| [fal-ai.md](./integrations/fal-ai.md) | Image generation |
| [voyage-embeddings.md](./integrations/voyage-embeddings.md) | Text/image embeddings |
| [uploadthing.md](./integrations/uploadthing.md) | File uploads |
| [biome-ultracite.md](./integrations/biome-ultracite.md) | Formatting and linting |

---

## AI Agent Rules (Ruler)

The `rules/` directory contains coding conventions formatted for [Ruler](./ruler.md)—a tool that generates CLAUDE.md, .cursorrules, etc.

**To use in a project:**

```bash
# Copy rules to your project
cp -r /path/to/build/rules /your-project/.ruler

# Rename the index
mv /your-project/.ruler/README.md /your-project/.ruler/agents.md

# Generate agent files
npx @intellectronica/ruler apply
```

See [ruler.md](./ruler.md) for full documentation and [rules/README.md](./rules/README.md) for the rule index.

### What's in the Rules

| Category | Files |
|----------|-------|
| **Code** | [code-style](./rules/code-style.md), [typescript](./rules/typescript.md), [react](./rules/react.md), [nextjs](./rules/nextjs.md), [tailwind](./rules/tailwind.md) |
| **Workflow** | [git](./rules/git.md), [testing](./rules/testing.md), [env](./rules/env.md), [turborepo](./rules/turborepo.md), [integrations](./rules/integrations.md) |
| **Interface** | [animation](./rules/interface/animation.md), [forms](./rules/interface/forms.md), [interactions](./rules/interface/interactions.md), [layout](./rules/interface/layout.md), [design](./rules/interface/design.md), [performance](./rules/interface/performance.md), [accessibility](./rules/interface/content-accessibility.md) |

---

## Philosophy

### Canonical Code Principle

> Code is always canonical. No backward compatibility layers, deprecation warnings, or legacy patterns. When updating patterns or APIs, update ALL usage sites immediately. The codebase reflects current best practices only.

This means:
- No migration periods or compatibility shims
- Refactor fearlessly
- The current code IS the way

### Preferences

| Area | Preference |
|------|------------|
| Migrations | `db:push` over formal migrations |
| Components | Base UI primitives over Radix |
| Scaffolding | shadcn (own the code) |
| Gray palette | `gray-*` only (not slate/zinc/neutral) |
| AI text | `google/gemini-2.5-flash` via OpenRouter |
| AI images | `fal-ai/gpt-image-1.5` |
| Embeddings | `voyage-3-large` (text), `voyage-multimodal-3` (images) |
