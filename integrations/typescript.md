# TypeScript Configuration

TypeScript setup for Next.js projects, with patterns for monorepo shared configurations.

## Single App Setup

### tsconfig.json

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "noEmit": true,

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Key Options Explained

| Option | Value | Why |
|--------|-------|-----|
| `moduleResolution: "bundler"` | Required for Next.js 14+ | Supports package.json `exports` field |
| `noUncheckedIndexedAccess` | `true` | Forces null checks on array/object access |
| `noEmit` | `true` | Next.js handles compilation |
| `strict` | `true` | Enables all strict type checking |
| `skipLibCheck` | `true` | Faster builds, check your code only |

## Monorepo Setup

In a monorepo, share TypeScript configuration across packages using a dedicated config package.

```
packages/
├── typescript-config/
│   ├── base.json
│   ├── nextjs.json
│   ├── library.json
│   └── package.json
├── ui/
│   └── tsconfig.json      # extends @project/typescript-config/library
├── db/
│   └── tsconfig.json      # extends @project/typescript-config/library
apps/
├── web/
│   └── tsconfig.json      # extends @project/typescript-config/nextjs
```

### packages/typescript-config/package.json

```json
{
  "name": "@project/typescript-config",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  }
}
```

### packages/typescript-config/base.json

Shared settings for all packages:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  }
}
```

### packages/typescript-config/nextjs.json

For Next.js apps:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "ES2022"],
    "jsx": "preserve",
    "noEmit": true,
    "incremental": true,
    "plugins": [{ "name": "next" }]
  }
}
```

### packages/typescript-config/library.json

For internal packages (db, api, utils):

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

### Using the Shared Configs

**apps/web/tsconfig.json:**

```json
{
  "extends": "@project/typescript-config/nextjs",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@project/db": ["../../packages/db/src"],
      "@project/ui": ["../../packages/ui/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**packages/db/tsconfig.json:**

```json
{
  "extends": "@project/typescript-config/library",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

## Just-in-Time Packages

For internal monorepo packages, export TypeScript source directly—no build step needed:

**packages/ui/package.json:**

```json
{
  "name": "@project/ui",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.tsx"
  },
  "devDependencies": {
    "@project/typescript-config": "workspace:*",
    "typescript": "^5.9.3"
  }
}
```

**packages/ui/tsconfig.json:**

```json
{
  "extends": "@project/typescript-config/library",
  "compilerOptions": {
    "jsx": "react-jsx",
    "noEmit": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

Benefits:
- No build step for internal packages
- Instant updates during development
- Better source maps for debugging
- Simpler package setup

## Path Aliases

### Single App

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Usage: `import { Button } from "@/components/button"`

### Monorepo with Workspace Packages

For packages installed via `workspace:*`, TypeScript resolves them automatically. Add explicit paths only for better IDE performance:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@project/db": ["../../packages/db/src"],
      "@project/ui": ["../../packages/ui/src"],
      "@project/api": ["../../packages/api/src"]
    }
  }
}
```

## Type-Only Imports

Always use `import type` for type-only imports:

```ts
// Good
import type { User } from "@project/db";
import { createUser } from "@project/db";

// Also good (combined)
import { createUser, type User } from "@project/db";

// Bad - imports type as value
import { User } from "@project/db";
```

This ensures types are erased at build time and prevents circular dependency issues.

## Strict Settings

### noUncheckedIndexedAccess

Forces null checks when accessing arrays or objects by index:

```ts
const items = ["a", "b", "c"];

// Without noUncheckedIndexedAccess
const first = items[0]; // type: string

// With noUncheckedIndexedAccess
const first = items[0]; // type: string | undefined

// Must handle undefined
if (first) {
  console.log(first.toUpperCase());
}

// Or use non-null assertion (avoid if possible)
const first = items[0]!;
```

### strict

Enables all strict type-checking options:
- `strictNullChecks`
- `strictFunctionTypes`
- `strictBindCallApply`
- `strictPropertyInitialization`
- `noImplicitAny`
- `noImplicitThis`
- `alwaysStrict`

## Common Patterns

### Zod Schema Inference

```ts
import { z } from "zod";

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
});

type User = z.infer<typeof userSchema>;
```

### Drizzle Table Inference

```ts
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./schema";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
```

### Component Props with HTML Attributes

```ts
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", ...props }: ButtonProps) {
  return <button {...props} />;
}
```

### Generic Components

```ts
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

## IDE Setup

### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.preferences.preferTypeOnlyAutoImports": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit"
  }
}
```

### Recommended Extensions

- **TypeScript + JavaScript** (built-in)
- **Pretty TypeScript Errors** - Better error formatting
- **Import Cost** - Show import sizes
