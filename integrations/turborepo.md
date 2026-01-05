# Turborepo

Turborepo for monorepo orchestration with pnpm workspaces. Fast builds through intelligent caching and parallel execution.

## Project Structure

```
my-monorepo/
├── apps/
│   ├── web/                 # Main Next.js app
│   ├── admin/               # Admin dashboard
│   └── storybook/           # Component documentation
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── db/                  # Database client & queries
│   ├── env/                 # Environment validation
│   ├── trpc/                # tRPC router setup
│   ├── utils/               # Shared utilities
│   ├── typescript-config/   # Shared TypeScript configs
│   └── tailwind-config/     # Shared Tailwind config
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Installation

```bash
pnpm add -D turbo -w
```

### pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Root package.json

```json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "format": "turbo format"
  },
  "devDependencies": {
    "turbo": "^2.7.0"
  }
}
```

## turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "stream",
  "globalDependencies": ["**/.env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "format": {
      "cache": false
    },
    "db:push": {
      "cache": false
    },
    "db:studio": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Task Configuration

| Option | Purpose |
|--------|---------|
| `dependsOn: ["^build"]` | Wait for dependencies to build first |
| `cache: false` | Disable caching (for dev, db tasks) |
| `persistent: true` | Long-running process (dev servers) |
| `inputs` | Files that affect cache key |
| `outputs` | Directories to cache |
| `env` | Environment variables affecting build |

## Just-in-Time Packages

Export TypeScript source directly—no build step:

### Package Configuration

```json
{
  "name": "@project/ui",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./components/*": "./src/components/*.tsx",
    "./lib/*": "./src/lib/*.ts",
    "./utils/*": "./src/utils/*.ts"
  },
  "devDependencies": {
    "@project/typescript-config": "workspace:*",
    "typescript": "^5.9.0"
  }
}
```

### tsconfig.json

```json
{
  "extends": "@project/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

No `build` script needed—TypeScript source is imported directly.

## Shared Configuration Packages

### typescript-config

```
packages/typescript-config/
├── base.json
├── nextjs.json
├── react-library.json
└── package.json
```

```json
{
  "name": "@project/typescript-config",
  "version": "0.0.0",
  "private": true,
  "files": ["*.json"]
}
```

```json
// base.json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  }
}
```

```json
// nextjs.json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "plugins": [{ "name": "next" }]
  }
}
```

### tailwind-config

```
packages/tailwind-config/
├── shared-styles.css
└── package.json
```

```json
{
  "name": "@project/tailwind-config",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./shared-styles.css": "./shared-styles.css"
  }
}
```

```css
/* shared-styles.css */
@import "tailwindcss";

@source "../ui/src/**/*.{ts,tsx}";
@source "../../apps/**/src/**/*.{ts,tsx}";

@theme {
  --color-primary: var(--color-gray-900);
  --color-primary-foreground: var(--color-gray-50);
  /* ... other tokens */
}
```

## App Configuration

### App package.json

```json
{
  "name": "@project/web",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 4000",
    "build": "next build",
    "start": "next start -p 4000",
    "lint": "biome check . --write",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@project/db": "workspace:*",
    "@project/env": "workspace:*",
    "@project/trpc": "workspace:*",
    "@project/ui": "workspace:*",
    "next": "^16.1.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@project/typescript-config": "workspace:*",
    "typescript": "^5.9.0"
  }
}
```

### Importing from Packages

```tsx
// In apps/web/src/app/page.tsx
import { Button } from "@project/ui/components/button";
import { db } from "@project/db/client";
import { env } from "@project/env/server";
```

## Common Packages

### Database Package

```
packages/db/
├── src/
│   ├── client.ts      # Database connection
│   ├── schema.ts      # Drizzle schema
│   └── queries/       # Typed queries
├── drizzle.config.ts
└── package.json
```

```json
{
  "name": "@project/db",
  "exports": {
    "./client": "./src/client.ts",
    "./schema": "./src/schema.ts",
    "./queries/*": "./src/queries/*.ts"
  },
  "scripts": {
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Environment Package

```
packages/env/
├── src/
│   ├── server.ts      # Server-only env
│   └── next.ts        # Next.js app env
└── package.json
```

```json
{
  "name": "@project/env",
  "exports": {
    "./server": "./src/server.ts",
    "./next": "./src/next.ts"
  }
}
```

### Utils Package

```
packages/utils/
├── src/
│   ├── format.ts
│   ├── dates.ts
│   └── strings.ts
└── package.json
```

```json
{
  "name": "@project/utils",
  "exports": {
    "./*": "./src/*.ts"
  }
}
```

## Running Tasks

```bash
# Run all dev servers
pnpm dev

# Build all packages
pnpm build

# Run specific task for one package
pnpm --filter @project/web dev
pnpm --filter @project/web build

# Run task for package and dependencies
pnpm --filter @project/web... build

# Run task for all packages matching pattern
pnpm --filter "@project/*" typecheck
```

## Caching

Turbo caches task outputs automatically:

```bash
# First run - executes tasks
pnpm build
# 3 successful, 0 cached

# Second run - uses cache
pnpm build
# 3 successful, 3 cached
```

### Cache Invalidation

Cache is invalidated when:
- Input files change (`inputs` in turbo.json)
- Environment variables change (`env` in turbo.json)
- Dependencies rebuild (`dependsOn: ["^build"]`)
- Global dependencies change (`globalDependencies`)

### Remote Caching

Enable Vercel Remote Cache for CI:

```bash
npx turbo login
npx turbo link
```

## Environment Variables

Include env vars in cache key:

```json
{
  "tasks": {
    "build": {
      "env": ["DATABASE_URL", "NEXT_PUBLIC_API_URL"]
    }
  }
}
```

## Best Practices

1. **JIT packages** — Export source TypeScript, no build step
2. **workspace:\*** — Use for all internal dependencies
3. **Centralize config** — typescript-config, tailwind-config packages
4. **Explicit exports** — Use package.json exports field
5. **Cache dev tasks: false** — Dev servers shouldn't be cached
6. **persistent: true** — For long-running processes
7. **dependsOn: ["^build"]** — Build dependencies first
8. **globalDependencies** — Include .env files
9. **No index.ts in packages** — Use explicit exports
10. **Separate db package** — Centralize all database access
