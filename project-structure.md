# Project Structure Patterns

Two patterns emerge across your projects: **monorepos** (Turborepo) and **single apps**.

## Decision Matrix

| Use Case | Pattern | Example Projects |
|----------|---------|------------------|
| Multiple apps sharing code | Monorepo | kinecho, materia, blomma |
| Single app with internal packages | Monorepo | throughline, beacon |
| Standalone app, no code sharing | Single App | notiflow, reccs, faceplacer |
| Rapid prototype | Single App | Start here, extract later |

## Monorepo Structure (Turborepo + pnpm)

```
project/
├── apps/
│   ├── web/                    # Main Next.js app
│   │   ├── app/                # App Router
│   │   ├── components/         # App-specific components
│   │   ├── features/           # Feature modules
│   │   └── package.json
│   ├── admin/                  # Admin app (optional)
│   └── api/                    # Standalone API (optional)
├── packages/
│   ├── db/                     # Drizzle schema + queries
│   ├── auth/                   # Auth logic
│   ├── api/                    # tRPC routers
│   ├── env/                    # Environment validation
│   ├── ui/                     # Shared components
│   ├── utils/                  # Shared utilities
│   ├── config/                 # Shared configs
│   └── typescript-config/      # TSConfig presets
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Root package.json (Monorepo)

```json
{
  "name": "project-name",
  "private": true,
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint && biome check .",
    "format": "ultracite fix",
    "typecheck": "turbo run typecheck",
    "db:push": "pnpm --filter @project/db db:push",
    "db:studio": "pnpm --filter @project/db db:studio"
  },
  "devDependencies": {
    "@biomejs/biome": "2.3.10",
    "turbo": "^2.7.2",
    "typescript": "5.9.3",
    "ultracite": "^7.0.0"
  },
  "packageManager": "pnpm@10.23.0",
  "engines": {
    "node": ">=20.19"
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
```

### Workspace References

In app package.json:
```json
{
  "dependencies": {
    "@project/db": "workspace:*",
    "@project/auth": "workspace:*",
    "@project/env": "workspace:*"
  }
}
```

## Single App Structure

```
project/
├── src/
│   ├── app/                    # App Router
│   ├── components/             # UI components
│   ├── db/                     # Drizzle schema
│   ├── lib/                    # Utilities
│   └── server/                 # Server actions
├── e2e/                        # Playwright tests
├── drizzle.config.ts
└── package.json
```

### Root package.json (Single App)

```json
{
  "name": "project-name",
  "version": "0.1.0",
  "private": true,
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

## Feature Structure (within apps)

For complex features, organize by feature then by kind:

```
apps/web/features/
├── dashboard/
│   ├── components/
│   │   ├── dashboard-header.tsx
│   │   └── dashboard-stats.tsx
│   ├── hooks/
│   │   └── use-dashboard-data.ts
│   ├── lib/
│   │   └── dashboard-utils.ts
│   └── types.ts
└── settings/
    └── ...
```

## Package Patterns

### Database Package (@project/db)

```
packages/db/
├── src/
│   ├── index.ts                # Exports
│   ├── client.ts               # Drizzle client
│   ├── schema/
│   │   ├── users.ts
│   │   └── index.ts
│   └── queries/
│       └── users.ts
├── drizzle.config.ts
└── package.json
```

### Environment Package (@project/env)

```
packages/env/
├── src/
│   ├── server.ts               # Server-only vars
│   ├── next.ts                 # Next.js vars (server + client)
│   └── index.ts
└── package.json
```

## Just-in-Time Packages

Export TypeScript source directly—no build step:

```json
{
  "name": "@project/utils",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  }
}
```

This enables:
- Instant updates during dev
- Better source maps
- Simpler package setup
