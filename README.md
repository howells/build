# Daniel Howells Stack Documentation

Reference documentation distilled from 15 active projects. Use this to bootstrap new apps or modernize existing ones.

## Documents

| File | Purpose |
|------|---------|
| [version-requirements.md](./version-requirements.md) | **Mandatory versions for new projects** |
| [stack-overview.md](./stack-overview.md) | Core tech stack with current versions |
| [project-structure.md](./project-structure.md) | Monorepo vs single-app patterns |
| [dependencies.md](./dependencies.md) | Complete dependency reference |
| [scripts.md](./scripts.md) | Standard npm scripts |
| [new-project-checklist.md](./new-project-checklist.md) | Quick-start guide |
| [production-checklist.md](./production-checklist.md) | **Pre-launch SEO, analytics, deployment** |

## Integration Guides

| File | Purpose |
|------|---------|
| [integrations/openrouter.md](./integrations/openrouter.md) | Multi-model AI via OpenRouter |
| [integrations/biome-ultracite.md](./integrations/biome-ultracite.md) | Formatting and linting |
| [integrations/voyage-embeddings.md](./integrations/voyage-embeddings.md) | Text embeddings for search/RAG |
| [integrations/uploadthing.md](./integrations/uploadthing.md) | File uploads |
| [integrations/fal-ai.md](./integrations/fal-ai.md) | Image generation (Flux, etc.) |
| [integrations/clerk-auth.md](./integrations/clerk-auth.md) | Authentication |
| [integrations/trpc.md](./integrations/trpc.md) | Type-safe APIs |
| [integrations/drizzle-neon.md](./integrations/drizzle-neon.md) | Database ORM + serverless PostgreSQL |

## Mandatory Minimums (New Projects)

| Package | Minimum | Why |
|---------|---------|-----|
| next | **16.0.0** | Turbopack stable, async params/headers |
| react | **19.0.0** | ref-as-prop, use() hook, no forwardRef |
| typescript | **5.8.0** | Improved inference |
| tailwindcss | **4.0.0** | Config-free, CSS-first |
| zod | **4.0.0** | Breaking inference changes |
| node | **20.9.0** | Required for Next.js 16 |

See [version-requirements.md](./version-requirements.md) for breaking changes and upgrade guides.

## Current Stack (Jan 2026)

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

## Canonical Code Principle

From your CLAUDE.md files—the philosophy that ties everything together:

> Code is always canonical. No backward compatibility layers, deprecation warnings, or legacy patterns. When updating patterns or APIs, update ALL usage sites immediately. The codebase reflects current best practices only.

This means:
- No migration periods or compatibility shims
- Refactor fearlessly
- The current code IS the way
