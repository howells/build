# Dependencies Reference

Complete dependency list with current versions and installation commands.

## Philosophy

Prefer battle-tested packages over custom implementations:

- **Hooks**: Use `usehooks-ts` instead of writing custom hooks
- **Utilities**: Use `es-toolkit` instead of lodash (faster, smaller, TypeScript-first)
- **Dates**: Use `dayjs` (lighter than moment, better than native Date)
- **Forms**: Use `react-hook-form` + `zod` for validation
- **State**: Server state with React Query, client state with Zustand
- **UI**: Headless primitives (Base UI > Radix UI) styled with Tailwind
- **Animation**: `motion` library for new projects

## Core Dependencies

### Framework
```bash
pnpm add next@16.1.1 react@19.2.3 react-dom@19.2.3
pnpm add -D typescript@5.9.3 @types/node@25 @types/react@19 @types/react-dom@19
```

### Styling
```bash
pnpm add tailwind-merge@3.4.0 class-variance-authority@0.7.1 clsx@2.1.1 tw-animate-css@1.4.0
pnpm add -D tailwindcss@4 @tailwindcss/postcss@4
```

### Database (Neon + Drizzle)
```bash
pnpm add drizzle-orm@0.45.1 @neondatabase/serverless@1.0.2
pnpm add -D drizzle-kit@0.31.8
```

### Database (Supabase + Drizzle)
```bash
pnpm add drizzle-orm@0.45.1 postgres@3.4.7 @supabase/supabase-js@2.89.0 @supabase/ssr@0.8.0
pnpm add -D drizzle-kit@0.31.8
```

### Authentication (Clerk)
```bash
pnpm add @clerk/nextjs@6.36.5
pnpm add -D @clerk/testing@1.13.26
```

### API (tRPC)

New projects use `@trpc/tanstack-react-query`. Existing projects may use `@trpc/react-query`.

```bash
# New projects
pnpm add @trpc/server@11.5.0 @trpc/client@11.5.0 @trpc/tanstack-react-query@11.5.0 superjson@2.2.2 zod@4.3.4

# Existing projects (classic package)
pnpm add @trpc/server@11.5.0 @trpc/client@11.5.0 @trpc/react-query@11.5.0 superjson@2.2.2 zod@4.3.4
```

### Data Fetching
```bash
pnpm add @tanstack/react-query@5.90.16
pnpm add -D @tanstack/react-query-devtools@5.85.5
```

## UI Components

### Base UI (Unstyled Primitives)
```bash
pnpm add @base-ui/react@1.0.0
```

### Radix UI (Individual Primitives)
```bash
pnpm add @radix-ui/react-slot@1.2.4 @radix-ui/react-label@2.1.8 @radix-ui/react-select@2.2.6
```

### shadcn CLI
```bash
pnpm add shadcn@3.6.2
pnpm dlx shadcn@latest add button card dialog
```

### Icons
```bash
pnpm add lucide-react@0.562.0
```

### Notifications
```bash
pnpm add sonner@2.0.5
```

### Command Palette
```bash
pnpm add cmdk@1.1.1
```

### Drawer
```bash
pnpm add vaul@1.1.2
```

## Animation

```bash
# Full library
pnpm add framer-motion@12.23.26

# Lighter alternative (same API)
pnpm add motion@12.23.26
```

## AI/ML

### Vercel AI SDK
```bash
pnpm add ai@6.0.5 @ai-sdk/openai@3.0.0
```

### OpenRouter (Multi-model)
```bash
pnpm add @openrouter/ai-sdk-provider@1.5.4
```

### Image Generation (fal.ai)
```bash
pnpm add @fal-ai/client@1.8.1
```

### Embeddings (Voyage)

Use `voyage-3-large` for text, `voyage-multimodal-3` for images.

```bash
pnpm add voyage-ai-provider@3.0.0 voyageai@0.1.0
```

## Code Quality

### Biome + Ultracite
```bash
pnpm add -D @biomejs/biome@2.3.10 ultracite@7.0.5
```

### Git Hooks
```bash
pnpm add -D husky@9.1.7 lint-staged@16.2.7
```

### Dead Code Detection
```bash
pnpm add -D knip@5.78.0
```

## Testing

### E2E (Playwright)
```bash
pnpm add -D @playwright/test@1.57.0
```

### Unit (Vitest)
```bash
pnpm add -D vitest@4.0.16 @vitest/ui@4.0.16 @vitejs/plugin-react@5.1.2
```

### React Testing
```bash
pnpm add -D @testing-library/react@16.3.1 @testing-library/dom@10.4.1 jsdom@27.4.0
```

## Build Tools

### Monorepo
```bash
pnpm add -D turbo@2.7.2
```

### TypeScript Execution
```bash
pnpm add -D tsx@4.21.0
```

### Package Bundling
```bash
pnpm add -D tsdown@0.15.12
```

## File Uploads

```bash
pnpm add uploadthing@7.7.4 @uploadthing/react@7.3.3
```

## Payments (Polar)

```bash
pnpm add @polar-sh/nextjs@0.9.3 @polar-sh/sdk@0.42.1
```

## Utilities

### ID Generation
```bash
pnpm add nanoid@5.1.6
```

### Environment Variables
```bash
pnpm add dotenv@17.2.3
pnpm add -D dotenv-cli@11.0.0
```

### Theme Switching
```bash
pnpm add next-themes@0.4.6
```

### Client State
```bash
pnpm add zustand@5.0.8
```

### React Hooks
```bash
pnpm add usehooks-ts@3.1.1
```

Common hooks: `useLocalStorage`, `useMediaQuery`, `useDebounce`, `useCopyToClipboard`, `useWindowSize`, `useEventListener`, `useIntersectionObserver`

### Utility Functions
```bash
pnpm add es-toolkit@1.35.1
```

Modern lodash replacement—2-3x faster, smaller bundle, TypeScript-first. Use for: `debounce`, `throttle`, `groupBy`, `chunk`, `uniq`, `pick`, `omit`, `cloneDeep`, etc.

https://es-toolkit.dev/

### Date/Time
```bash
pnpm add dayjs@1.11.15
```

### Forms
```bash
pnpm add react-hook-form@7.56.4 @hookform/resolvers@5.0.1
```

### Carousels
```bash
pnpm add embla-carousel-react@8.7.4
```

### Markdown Rendering
```bash
pnpm add react-markdown@10.1.0 marked@17.0.1
```

### AI Streaming Markdown
```bash
pnpm add streamdown@1.6.10
```

### Syntax Highlighting
```bash
pnpm add shiki@3.20.0
```

### Flow Diagrams
```bash
pnpm add @xyflow/react@12.10.0
```

### Fuzzy Search
```bash
pnpm add fuse.js@7.1.0
```

### Web Scraping
```bash
pnpm add cheerio@1.0.0 scrapingbee@1.7.6
```

### CSV Parsing
```bash
pnpm add papaparse@5.5.3
pnpm add -D @types/papaparse@5.5.2
```

## Maps

```bash
pnpm add mapbox-gl@3.10.0 h3-js@4.2.0
pnpm add -D @types/mapbox-gl@3.4.0
```

## Desktop (Tauri)

```bash
pnpm add -D @tauri-apps/cli@2.4.0
```

## Version Alignment

When updating, keep these groups aligned:

| Group | Packages |
|-------|----------|
| React | react, react-dom, @types/react, @types/react-dom |
| tRPC | @trpc/server, @trpc/client, @trpc/tanstack-react-query |
| TanStack | @tanstack/react-query, @tanstack/react-query-devtools |
| Tailwind | tailwindcss, @tailwindcss/postcss |
| Drizzle | drizzle-orm, drizzle-kit |
| AI SDK | ai, @ai-sdk/openai |

## Packages to Avoid

| Package | Reason | Use Instead |
|---------|--------|-------------|
| moment | Large bundle, deprecated | dayjs |
| lodash | Large bundle, not TypeScript-first | es-toolkit |
| react-use | Less maintained | usehooks-ts |
| Swiper | Heavy, complex API | embla-carousel |
| Custom useDebounce | Reinventing the wheel | usehooks-ts or es-toolkit |
| Custom useLocalStorage | Edge cases handled poorly | usehooks-ts |
| Custom useMediaQuery | Browser inconsistencies | usehooks-ts |
