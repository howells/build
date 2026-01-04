# Standard Scripts

Consistent npm scripts across all projects.

## Development

| Script | Command | Notes |
|--------|---------|-------|
| `dev` | `next dev --turbopack --port XXXX` | Single app |
| `dev` | `turbo run dev --parallel` | Monorepo |
| `dev:web` | `turbo run dev --filter web` | Specific app |
| `build` | `next build` or `turbo run build` | Production build |
| `start` | `next start` | Production server |

### Port Assignments

| Project | Port |
|---------|------|
| notiflow | 4000 |
| reccs | 5001 |
| populararchive | 7000 |
| scenes | 8000 |
| kinecho | 9000 |
| massiveconnects | 10000 |
| faceplacer | 11000 |
| beacon | 12000 |
| beeline | 13000 |
| blomma web | 14000 |
| blomma admin | 14001 |
| blomma api | 14002 |
| designround | 15000 |
| throughline | 16000 |

## Code Quality

| Script | Command | Purpose |
|--------|---------|---------|
| `lint` | `biome check src --write` | Lint + autofix |
| `format` | `biome format src --write` | Format only |
| `typecheck` | `tsc --noEmit` | Type checking |

### Ultracite (Biome Preset)

```bash
# Check without fixing
ultracite check

# Fix all issues
ultracite fix

# Unsafe fixes (use with care)
ultracite fix --unsafe

# Diagnose setup
ultracite doctor
```

### Monorepo Lint

```json
{
  "lint": "turbo run lint && biome check .",
  "format": "ultracite fix"
}
```

## Database (Drizzle)

| Script | Command | Purpose |
|--------|---------|---------|
| `db:push` | `drizzle-kit push` | Push schema to DB |
| `db:studio` | `drizzle-kit studio` | Open Drizzle Studio |
| `db:generate` | `drizzle-kit generate` | Generate migrations |
| `db:migrate` | `drizzle-kit migrate` | Run migrations |

### Monorepo Database

```json
{
  "db:push": "pnpm --filter @project/db db:push",
  "db:studio": "pnpm --filter @project/db db:studio"
}
```

## Testing

| Script | Command | Purpose |
|--------|---------|---------|
| `test` | `vitest run` | Run unit tests |
| `test:watch` | `vitest` | Watch mode |
| `test:coverage` | `vitest run --coverage` | With coverage |
| `test:e2e` | `playwright test` | E2E tests |
| `test:e2e:ui` | `playwright test --ui` | E2E with UI |
| `test:e2e:headed` | `playwright test --headed` | Visible browser |

## Git Hooks (Husky + lint-staged)

### Setup

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

### package.json

```json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json,jsonc,css,scss,md,mdx}": [
      "bun x ultracite fix"
    ]
  }
}
```

### .husky/pre-commit

```bash
pnpm lint-staged
```

## Monorepo Utilities

| Script | Command | Purpose |
|--------|---------|---------|
| `clean` | `git clean -xdf node_modules` | Remove all node_modules |
| `clean:workspaces` | `turbo clean` | Clean build outputs |
| `check` | `pnpm typecheck && pnpm lint` | Full check |

### Manypkg (Dependency Consistency)

```bash
pnpm add -D @manypkg/cli
```

```json
{
  "lint": "turbo run lint && manypkg check"
}
```

## Ruler (Code Rules)

Some projects use `ruler` for applying code rules:

```json
{
  "rules:apply": "ruler apply --backup=false --nested",
  "rules:clean": "ruler revert --keep-backups=false"
}
```

## Kill Ports (Utility)

For development port conflicts:

```json
{
  "kill-ports": "node ./scripts/kill-dev-ports.mjs"
}
```

## Full Monorepo Example

```json
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "dev:web": "turbo run dev --filter web",
    "build": "turbo run build",
    "start": "turbo run start",
    "lint": "turbo run lint && biome check .",
    "format": "ultracite fix",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "clean": "git clean -xdf node_modules",
    "db:push": "pnpm --filter @project/db db:push",
    "db:studio": "pnpm --filter @project/db db:studio",
    "prepare": "husky"
  }
}
```

## Full Single App Example

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
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:generate": "drizzle-kit generate"
  }
}
```
