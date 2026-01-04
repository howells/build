# Environment Variable Validation

Type-safe environment variables with Zod. No t3-env—just pure Zod with explicit test handling.

## Why Not t3-env?

t3-env has issues with:
- Playwright tests (validation runs before env is loaded)
- Vitest setup timing
- Vercel build phase (missing runtime vars during static generation)
- Complex `runtimeEnv` mapping that's easy to forget

**This approach**: Pure Zod schemas with a `SKIP_ENV_VALIDATION` flag that tests and builds can set.

## Single App Setup

### env.ts

```ts
// env.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),

  // Server-only
  DATABASE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(32).optional(),

  // Client (must be NEXT_PUBLIC_)
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
});

function validateEnv() {
  // Skip during tests or Vercel build phase
  const isVercelBuild = process.env.VERCEL === "1" && process.env.CI === "1";

  if (process.env.SKIP_ENV_VALIDATION === "true" || isVercelBuild) {
    return process.env as unknown as z.infer<typeof envSchema>;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.format());
    throw new Error("Invalid environment variables");
  }

  return result.data;
}

export const env = validateEnv();
```

### Usage

```ts
// Anywhere in your app
import { env } from "@/env";

const db = drizzle(env.DATABASE_URL);
```

## Monorepo Setup

For monorepos, create a shared `@project/env` package with separate server and client exports.

### packages/env/src/server.ts

```ts
import { z } from "zod";

function isPresent(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== undefined && value !== null;
}

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  DATABASE_URL: z.string().url().optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  VOYAGE_API_KEY: z.string().min(1).optional(),
  FAL_API_KEY: z.string().min(1).optional(),
  UPLOADTHING_TOKEN: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(32).optional(),
});

function validateServerEnv() {
  const isVercelBuild = process.env.VERCEL === "1" && process.env.CI === "1";

  if (process.env.SKIP_ENV_VALIDATION === "true" || isVercelBuild) {
    return process.env as unknown as z.infer<typeof serverSchema>;
  }

  const result = serverSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid server environment variables:");
    console.error(result.error.format());
    throw new Error("Invalid server environment variables");
  }

  return result.data;
}

export const serverEnv = validateServerEnv();
export type ServerEnv = typeof serverEnv;

/**
 * Require a server env var at runtime. Throws if missing.
 */
export function requireServerEnv<Key extends keyof ServerEnv>(
  key: Key
): NonNullable<ServerEnv[Key]> {
  const value = serverEnv[key];
  if (!isPresent(value)) {
    throw new Error(`Missing required environment variable: ${String(key)}`);
  }
  return value as NonNullable<ServerEnv[Key]>;
}
```

### packages/env/src/next.ts

```ts
import { z } from "zod";

function parseOptionalBoolean(value: unknown) {
  if (value === undefined || value === null || value === "") return;
  if (value === true || value === false) return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  return value;
}

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  // Boolean example (handles "true"/"false" strings)
  NEXT_PUBLIC_SHOW_DEVTOOLS: z.preprocess(
    parseOptionalBoolean,
    z.boolean().optional()
  ),
});

function validateEnv() {
  const isVercelBuild = process.env.VERCEL === "1" && process.env.CI === "1";

  if (process.env.SKIP_ENV_VALIDATION === "true" || isVercelBuild) {
    return process.env as unknown as z.infer<typeof clientSchema>;
  }

  const result = clientSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid Next.js environment variables:");
    console.error(result.error.format());
    throw new Error("Invalid Next.js environment variables");
  }

  return result.data;
}

export const env = validateEnv();
export type NextEnv = typeof env;
```

### packages/env/package.json

```json
{
  "name": "@project/env",
  "exports": {
    "./server": "./src/server.ts",
    "./next": "./src/next.ts"
  }
}
```

### apps/web/env.ts

App-specific env that combines shared schemas and enforces required vars:

```ts
import { env as nextEnv } from "@project/env/next";
import { requireServerEnv, serverEnv } from "@project/env/server";

export const env = {
  ...nextEnv,
  ...serverEnv,
  // Enforce these are present for this app
  DATABASE_URL: requireServerEnv("DATABASE_URL"),
  CLERK_SECRET_KEY: requireServerEnv("CLERK_SECRET_KEY"),
};

export type WebEnv = typeof env;
```

## Test Configuration

### Playwright

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      SKIP_ENV_VALIDATION: "true",
    },
  },
});
```

### Vitest

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      SKIP_ENV_VALIDATION: "true",
    },
  },
});
```

Or in a setup file:

```ts
// vitest.setup.ts
process.env.SKIP_ENV_VALIDATION = "true";

// Set any test-specific env vars
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
```

### Scripts

For standalone scripts that don't need all vars:

```json
{
  "scripts": {
    "sync:data": "SKIP_ENV_VALIDATION=true tsx scripts/sync.ts"
  }
}
```

## Key Patterns

### Optional vs Required

In the shared schema, make everything `.optional()`. Then use `requireServerEnv()` in app-specific env files to enforce what that app actually needs:

```ts
// Schema: optional (other apps may not need it)
STRIPE_SECRET_KEY: z.string().min(1).optional(),

// App env.ts: required for this app
STRIPE_SECRET_KEY: requireServerEnv("STRIPE_SECRET_KEY"),
```

### Boolean Environment Variables

Env vars are always strings. Use `preprocess` to handle `"true"`/`"false"`:

```ts
NEXT_PUBLIC_DEBUG: z.preprocess(
  parseOptionalBoolean,
  z.boolean().optional()
),
```

### Coerced Numbers

```ts
TYPESENSE_PORT: z.coerce.number().optional().default(443),
```

### URL Validation

```ts
DATABASE_URL: z.string().url(),
APP_URL: z.string().url(),
```

### Minimum Length (for secrets)

```ts
JWT_SECRET: z.string().min(32),
CRON_SECRET: z.string().min(32),
```

## When Validation Runs

| Context | Behavior |
|---------|----------|
| Dev server | Validates on startup, fails fast |
| Production | Validates on startup, fails fast |
| Vercel build | Skipped (static generation phase) |
| Playwright tests | Skipped via `SKIP_ENV_VALIDATION` |
| Vitest tests | Skipped via `SKIP_ENV_VALIDATION` |
| Scripts | Skipped when flag is set |

## Never Do

```ts
// Direct process.env access - no validation, no types
const apiKey = process.env.API_KEY; // ❌

// Use the validated env instead
import { env } from "@/env";
const apiKey = env.API_KEY; // ✅
```
