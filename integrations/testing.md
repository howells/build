# Testing

Playwright for E2E tests, Vitest for unit tests. Both support React 19 and modern TypeScript.

## Installation

```bash
# E2E testing
pnpm add -D @playwright/test

# Unit testing
pnpm add -D vitest @vitest/ui

# React component testing
pnpm add -D @testing-library/react @testing-library/dom jsdom
```

Install browsers for Playwright:

```bash
pnpm exec playwright install
```

## Playwright Setup

### playwright.config.ts

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",

  use: {
    baseURL: "http://localhost:4000",
    testIdAttribute: "data-testid",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],

  webServer: {
    command: "pnpm dev",
    url: "http://localhost:4000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### Test Structure

```
project/
├── e2e/
│   ├── auth.spec.ts
│   ├── checkout.spec.ts
│   └── fixtures/
│       └── auth.ts
├── src/
└── playwright.config.ts
```

## Test IDs

Use `data-testid` attributes for reliable element selection. Text content, CSS classes, and DOM structure change frequently—test IDs don't.

### Configuration

```ts
// playwright.config.ts
export default defineConfig({
  use: {
    testIdAttribute: "data-testid",
  },
});
```

### In Components

Add test IDs to interactive and assertable elements:

```tsx
export function LoginForm() {
  return (
    <form data-testid="login-form">
      <input
        type="email"
        data-testid="email-input"
        aria-label="Email"
      />
      <input
        type="password"
        data-testid="password-input"
        aria-label="Password"
      />
      <button type="submit" data-testid="login-button">
        Sign In
      </button>
      <p data-testid="error-message" className="text-red-500">
        {error}
      </p>
    </form>
  );
}
```

### In Tests

```ts
import { test, expect } from "@playwright/test";

test("user can log in", async ({ page }) => {
  await page.goto("/login");

  // Use test IDs for custom elements
  await page.getByTestId("email-input").fill("user@example.com");
  await page.getByTestId("password-input").fill("password123");
  await page.getByTestId("login-button").click();

  // Assert on test IDs
  await expect(page.getByTestId("dashboard-header")).toBeVisible();
});

test("shows error for invalid credentials", async ({ page }) => {
  await page.goto("/login");

  await page.getByTestId("email-input").fill("wrong@example.com");
  await page.getByTestId("password-input").fill("wrongpassword");
  await page.getByTestId("login-button").click();

  await expect(page.getByTestId("error-message")).toContainText("Invalid");
});
```

### Semantic Locators

For standard accessible elements, semantic locators are also good:

```ts
// These are stable because they rely on accessibility attributes
await page.getByRole("button", { name: "Submit" }).click();
await page.getByLabel("Email").fill("user@example.com");
await page.getByRole("heading", { name: "Dashboard" }).isVisible();

// Avoid these - they break when content changes
await page.getByText("Submit").click();  // Bad
await page.locator(".btn-primary").click();  // Bad
await page.locator("form > div > button").click();  // Very bad
```

### Naming Conventions

Use kebab-case with descriptive names:

```tsx
// Good
data-testid="user-profile-card"
data-testid="submit-button"
data-testid="error-message"
data-testid="nav-home-link"

// Bad
data-testid="card1"
data-testid="btn"
data-testid="UserProfileCard"
```

## Vitest Setup

### vitest.config.ts

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
```

### src/test/setup.ts

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

### Unit Test Example

```ts
// src/lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { formatCurrency, slugify } from "./utils";

describe("formatCurrency", () => {
  it("formats USD correctly", () => {
    expect(formatCurrency(1234.56, "USD")).toBe("$1,234.56");
  });

  it("handles zero", () => {
    expect(formatCurrency(0, "USD")).toBe("$0.00");
  });
});

describe("slugify", () => {
  it("converts to lowercase kebab-case", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("What's up?")).toBe("whats-up");
  });
});
```

### Component Test Example

```tsx
// src/components/button.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

## Vitest Browser Mode

For component tests in a real browser (not jsdom):

```bash
pnpm add -D @vitest/browser playwright
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
    },
  },
});
```

```tsx
// src/components/button.test.tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Button } from "./button";

test("button is visible in viewport", async () => {
  render(<Button>Click me</Button>);
  await expect.element(screen.getByRole("button")).toBeInViewport();
});
```

## Authentication in E2E Tests

### With Clerk

```ts
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";

test("authenticated user can access dashboard", async ({ page }) => {
  await setupClerkTestingToken({ page });
  await page.goto("/dashboard");
  await expect(page.getByTestId("dashboard-header")).toBeVisible();
});
```

### Reusable Auth Fixture

```ts
// e2e/fixtures/auth.ts
import { test as base } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await setupClerkTestingToken({ page });
    await use(page);
  },
});

export { expect } from "@playwright/test";
```

```ts
// e2e/dashboard.spec.ts
import { test, expect } from "./fixtures/auth";

test("shows user profile", async ({ authenticatedPage: page }) => {
  await page.goto("/dashboard");
  await expect(page.getByTestId("user-profile")).toBeVisible();
});
```

## Monorepo Structure

```
apps/
├── web/
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   └── checkout.spec.ts
│   ├── src/
│   │   └── components/
│   │       └── button.test.tsx
│   ├── playwright.config.ts
│   └── vitest.config.ts
packages/
├── ui/
│   ├── src/
│   │   └── button.test.tsx
│   └── vitest.config.ts
```

### Root package.json Scripts

```json
{
  "scripts": {
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "test:coverage": "turbo run test:coverage"
  }
}
```

### App package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

## CI Setup

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"

      - run: pnpm install

      - name: Run unit tests
        run: pnpm test

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

## Debugging

### Playwright

```bash
# Run with visible browser
pnpm test:e2e --headed

# Run with UI mode (interactive)
pnpm test:e2e --ui

# Run with debug mode (step through)
pnpm test:e2e --debug

# Generate tests interactively
pnpm exec playwright codegen http://localhost:4000
```

### Vitest

```bash
# Run with UI
pnpm test --ui

# Run specific test file
pnpm test src/lib/utils.test.ts

# Run tests matching pattern
pnpm test -t "formatCurrency"
```

## Best Practices

1. **Test IDs over selectors** — Use `data-testid` for E2E, semantic queries for unit tests
2. **Isolate tests** — Each test should set up its own state, not depend on others
3. **Test behavior, not implementation** — Assert on what users see, not internal state
4. **Keep E2E tests focused** — Test critical paths, not every edge case
5. **Use unit tests for edge cases** — They're faster and more precise
6. **Don't test libraries** — Trust that React, Zod, etc. work correctly
