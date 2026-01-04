# Stack Overview

The recommended production stack for new projects (January 2026).

## Core Framework

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Framework | Next.js | 16.1.x | App Router, Server Components |
| React | React | 19.2.x | ref-as-prop, no forwardRef |
| Language | TypeScript | 5.9.x | Strict mode |
| Runtime | Node.js | >=20.9.0 | Required for Next.js 16 |

## Styling

| Tool | Version | Notes |
|------|---------|-------|
| Tailwind CSS | 4.x | Config-free, PostCSS only |
| @tailwindcss/postcss | 4.x | Required PostCSS plugin |
| tailwind-merge | 3.x | Class merging utility |
| tw-animate-css | 1.x | Animation utilities |
| class-variance-authority | 0.7.x | Component variants |
| clsx | 2.x | Conditional classes |

### Tailwind v4 Key Changes
- No `tailwind.config.js`—use CSS-based config
- Use `@source` directives for content paths
- PostCSS plugin: `@tailwindcss/postcss`
- Use `gray-*` palette only (not slate/zinc/neutral)

## Database

| Tool | Version | Purpose |
|------|---------|---------|
| Drizzle ORM | 0.45.x | Type-safe ORM |
| drizzle-kit | 0.31.x | Migrations/studio |
| @neondatabase/serverless | 1.x | Serverless PostgreSQL |
| postgres | 3.x | Node PostgreSQL driver |

### Alternative: Supabase
For projects needing Supabase features (Auth, Realtime, Storage), use `@supabase/supabase-js` + `@supabase/ssr` instead of Neon.

## Authentication

| Tool | Version | Notes |
|------|---------|-------|
| @clerk/nextjs | 6.x | Primary auth solution |
| @clerk/testing | 1.x | Test utilities |
| better-auth | 1.x | Self-hosted alternative |

## API Layer

| Tool | Version | Purpose |
|------|---------|---------|
| @trpc/server | 11.x | Type-safe API |
| @trpc/client | 11.x | Client bindings |
| @trpc/tanstack-react-query | 11.x | React integration (new projects) |
| zod | 4.x | Schema validation |
| superjson | 2.x | Serialization |

## Data Fetching

| Tool | Version | Notes |
|------|---------|-------|
| @tanstack/react-query | 5.90.x | Server state |
| @tanstack/react-query-devtools | 5.x | Dev tools |

## UI Components

| Tool | Version | Purpose |
|------|---------|---------|
| @base-ui/react | 1.x | Unstyled primitives (preferred) |
| @radix-ui/* | Various | Accessible primitives (legacy) |
| shadcn | 3.x | Component scaffolding |
| lucide-react | 0.56x | Icons |
| sonner | 2.x | Toasts |
| cmdk | 1.x | Command palette |
| vaul | 1.x | Drawer component |

### Component Strategy

**Use shadcn for scaffolding, prefer Base UI primitives.**

shadcn generates component code into your project—you own and customize it. When adding components:

1. **Check Base UI first** — Base UI components are unstyled and more flexible than Radix
2. **Fall back to Radix** — Only when Base UI doesn't have the primitive you need
3. **Customize freely** — shadcn components are yours to modify, not a dependency

Base UI advantages over Radix:
- Truly unstyled (no CSS reset battles)
- More composable API
- Smaller bundle size
- Better TypeScript inference

Example: For a new dropdown, use `@base-ui/react` Menu instead of `@radix-ui/react-dropdown-menu`.

## Animation

| Tool | Version | Notes |
|------|---------|-------|
| framer-motion | 12.x | Full animation library |
| motion | 12.x | Lighter alternative |

## AI/ML

| Tool | Version | Purpose |
|------|---------|---------|
| ai (Vercel AI SDK) | 6.x | AI integration |
| @openrouter/ai-sdk-provider | 1.x | Multi-model routing |
| @fal-ai/client | 1.x | Image generation |
| voyage-ai-provider | 3.x | Embeddings |

### Default Models

| Use Case | Model | Provider |
|----------|-------|----------|
| Text/Chat | `google/gemini-2.5-flash` | OpenRouter |
| Image Generation | `fal-ai/gpt-image-1.5` | fal.ai |
| Image Generation (alt) | `fal-ai/gemini-25-flash-image` | fal.ai |
| Text Embeddings | `voyage-3-large` | Voyage AI |
| Image Embeddings | `voyage-multimodal-3` | Voyage AI |

## Code Quality

| Tool | Version | Purpose |
|------|---------|---------|
| @biomejs/biome | 2.3.x | Formatting + linting |
| ultracite | 7.x | Biome preset |
| husky | 9.x | Git hooks |
| lint-staged | 16.x | Staged file linting |
| knip | 5.x | Unused code detection |

## Testing

| Tool | Version | Purpose |
|------|---------|---------|
| @playwright/test | 1.57.x | E2E testing |
| vitest | 4.x | Unit testing |
| @testing-library/react | 16.x | Component testing |
| jsdom | 27.x | DOM environment |

## Build Tools

| Tool | Version | Purpose |
|------|---------|---------|
| turbo | 2.7.x | Monorepo orchestration |
| tsx | 4.x | TypeScript execution |
| tsdown | 0.15.x | Package bundling |

## File Uploads

| Tool | Version | Notes |
|------|---------|-------|
| uploadthing | 7.x | File upload service |
| @uploadthing/react | 7.x | React components |

## Misc Utilities

| Tool | Purpose |
|------|---------|
| nanoid | ID generation |
| dotenv / dotenv-cli | Environment variables |
| next-themes | Theme switching |
| zustand | Client state (when needed) |
