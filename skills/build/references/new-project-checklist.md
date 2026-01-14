# New Project Checklist

Quick-start guide for bootstrapping a new project with your standard stack.

## Decision: Monorepo or Single App?

| Criteria | Single App | Monorepo |
|----------|------------|----------|
| Timeline | Fast prototype | Long-term project |
| Sharing | No code sharing needed | Multiple apps or packages |
| Team | Solo or small team | Larger team or future growth |
| Complexity | Simple domain | Complex domain |

## Option A: Single App (Fastest Start)

### 1. Create Next.js App

```bash
pnpm create next-app@latest project-name --typescript --tailwind --app --src-dir --import-alias "@/*"
cd project-name
```

### 2. Install Core Dependencies

```bash
# Styling
pnpm add tailwind-merge class-variance-authority clsx tw-animate-css
pnpm add -D @tailwindcss/postcss@4

# Database
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit

# Auth
pnpm add @clerk/nextjs

# Data fetching
pnpm add @tanstack/react-query zod

# UI
pnpm add @base-ui/react lucide-react shadcn

# Code quality
pnpm add -D @biomejs/biome ultracite husky lint-staged @playwright/test vitest
```

### 3. Configure Biome

```bash
pnpm exec ultracite init
```

Or create `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.5/schema.json",
  "extends": ["ultracite"]
}
```

### 4. Setup Pre-commit Hooks

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

Update `package.json`:

```json
{
  "scripts": {
    "prepare": "husky",
    "typecheck": "tsc --noEmit"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["pnpm exec ultracite fix"],
    "*.{json,jsonc,css,md,mdx}": ["pnpm exec biome format --write"]
  }
}
```

Update `.husky/pre-commit`:

```bash
#!/bin/sh
pnpm lint-staged
pnpm typecheck
```

### 5. Configure Tailwind v4

Create `postcss.config.mjs`:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {}
  }
};
```

Update `src/app/globals.css`:

```css
@import "tailwindcss";

@source "../**/*.{ts,tsx}";
```

### 6. Configure Drizzle

Create `drizzle.config.ts`:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### 7. Add Scripts

Update `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack --port 4000",
    "build": "next build",
    "start": "next start",
    "lint": "biome check src --write",
    "format": "biome format src --write",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### 8. Environment Variables

Create `.env.local`:

```bash
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

---

## Option B: Monorepo (Better-T-Stack)

The fastest way to scaffold a monorepo with your preferred stack:

```bash
bunx create-better-t-stack project-name
```

Select options:
- Database: Neon + Drizzle
- Auth: Clerk
- API: tRPC
- Linting: Ultracite
- Other: Turborepo

### Post-Setup

```bash
cd project-name
bun install
bun run db:push
bun run dev
```

---

## File Templates

### CLAUDE.md (Project Rules)

Create at project root—this tells AI assistants your conventions:

```markdown
# Project Rules

## Code Style
- Use Biome for formatting (no Prettier)
- Use double quotes, semicolons, trailing commas
- Prefer `for...of` over `.forEach()`
- Use kebab-case filenames

## Canonical Code Principle
- No backward compatibility layers
- Update ALL usage sites when changing patterns
- The current code IS the way

## TypeScript
- Use `interface` for objects, `type` for unions
- Never use `any`—prefer `unknown` with narrowing
- Use `import type` for type-only imports

## React
- Server Components by default
- Extract business logic to hooks
- Use @base-ui/react primitives
- Use ref-as-prop (React 19)

## Database
- Drizzle ORM + drizzle-kit
- `db:push` for development
- `db:generate` + `db:migrate` for production

## Testing
- Playwright for E2E
- Vitest for unit tests
- Run tests before merging
```

### .gitignore Additions

```gitignore
# Environment
.env
.env.local
.env*.local

# Drizzle
drizzle/

# Turbo
.turbo

# Next.js
.next/

# Testing
playwright-report/
test-results/
```

### tsconfig.json Paths

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Verification Checklist

Before starting development:

- [ ] `pnpm dev` starts without errors
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Pre-commit hooks work (make a test commit)
- [ ] Database connection works (`pnpm db:studio`)
- [ ] Auth flow works (sign in/out)
- [ ] CLAUDE.md created with project rules

---

## Updating Existing Projects

### Upgrade to Tailwind v4

1. Update dependencies:
```bash
pnpm add -D tailwindcss@4 @tailwindcss/postcss@4
```

2. Replace `tailwind.config.js` with CSS config in `globals.css`:
```css
@import "tailwindcss";
@source "../**/*.{ts,tsx}";
```

3. Update PostCSS config:
```js
export default {
  plugins: {
    "@tailwindcss/postcss": {}
  }
};
```

4. Remove old config files:
```bash
rm tailwind.config.js tailwind.config.ts
```

### Upgrade to React 19

1. Update dependencies:
```bash
pnpm add react@19 react-dom@19
pnpm add -D @types/react@19 @types/react-dom@19
```

2. Replace `forwardRef` with ref-as-prop:
```tsx
// Before
const Button = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  return <button ref={ref} {...props} />;
});

// After
function Button({ ref, ...props }: Props & { ref?: React.Ref<HTMLButtonElement> }) {
  return <button ref={ref} {...props} />;
}
```

### Switch from ESLint/Prettier to Biome

1. Install:
```bash
pnpm add -D @biomejs/biome ultracite
pnpm remove eslint prettier eslint-config-next @typescript-eslint/*
```

2. Initialize:
```bash
pnpm exec ultracite init
```

3. Update scripts:
```json
{
  "lint": "biome check src --write",
  "format": "biome format src --write"
}
```

4. Remove old configs:
```bash
rm .eslintrc* .prettierrc* eslint.config.*
```
