# Biome + Ultracite

Ultracite is a zero-config Biome preset that enforces strict code quality standards. Biome is the underlying Rust-based formatter and linter (replaces ESLint + Prettier).

## Why Biome?

| Feature | ESLint + Prettier | Biome |
|---------|-------------------|-------|
| Speed | ~5-10 seconds | ~50-200ms |
| Config files | 2+ files | 1 file |
| Dependencies | 10+ packages | 1 package |
| Language | JavaScript | Rust |

## Installation

```bash
pnpm add -D @biomejs/biome ultracite
```

## Configuration

### Option 1: Extend Ultracite (Recommended)

Create `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.5/schema.json",
  "extends": ["ultracite"]
}
```

### Option 2: Initialize Fresh

```bash
pnpm exec ultracite init
```

This creates a `biome.json` with Ultracite defaults.

## Commands

### Ultracite CLI

```bash
# Check for issues (no changes)
pnpm exec ultracite check

# Fix all issues
pnpm exec ultracite fix

# Fix including unsafe changes
pnpm exec ultracite fix --unsafe

# Diagnose configuration
pnpm exec ultracite doctor
```

### Direct Biome CLI

```bash
# Lint and fix
pnpm exec biome check src --write

# Format only
pnpm exec biome format src --write

# Lint only (no format)
pnpm exec biome lint src --write
```

## Package.json Scripts

### Single App

```json
{
  "scripts": {
    "lint": "biome check src --write",
    "format": "biome format src --write"
  }
}
```

### Monorepo

```json
{
  "scripts": {
    "lint": "turbo run lint && biome check .",
    "format": "ultracite fix"
  }
}
```

## Key Rules Enforced

### Formatting
- Double quotes for strings
- Semicolons always
- Trailing commas (ES5 style)
- 2-space indentation
- 80-character line width (soft)

### TypeScript
- No `any` type
- Use `interface` for objects, `type` for unions
- Use `import type` for type-only imports
- No non-null assertions (`!`)
- No `as any` casts

### React
- Hooks called at top level only
- All dependencies in hook arrays
- Keys required in iterables (no index keys)
- No component definitions inside components
- Accessible components (ARIA, semantic HTML)

### Modern JavaScript
- `for...of` over `.forEach()`
- Template literals over concatenation
- Optional chaining (`?.`) and nullish coalescing (`??`)
- `const` by default, `let` when needed, never `var`

### Imports
- Organized: external → internal → relative
- Node builtins prefixed: `node:fs`, `node:path`
- No namespace imports (`import * as`)

## Git Hooks Integration

### When to Use Pre-commit Hooks

| Project Size | Recommendation |
|--------------|----------------|
| New/Small (<50 files) | Lint + typecheck on commit |
| Medium (50-200 files) | Lint on commit, typecheck on push |
| Large (200+ files) | Lint staged only, typecheck in CI |

For new projects, always start with full checks on commit. You can relax later if it becomes slow.

### Setup Husky + lint-staged

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

### New Projects: Lint + Typecheck on Commit

#### package.json

```json
{
  "scripts": {
    "prepare": "husky",
    "typecheck": "tsc --noEmit"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "pnpm exec ultracite fix"
    ],
    "*.{json,jsonc,css,md,mdx}": [
      "pnpm exec biome format --write"
    ]
  }
}
```

#### .husky/pre-commit

```bash
#!/bin/sh
pnpm lint-staged
pnpm typecheck
```

### Large Projects: Staged Lint Only

For larger codebases where full typecheck is slow (>5 seconds):

#### .husky/pre-commit

```bash
#!/bin/sh
pnpm lint-staged
```

#### .husky/pre-push (typecheck before push)

```bash
#!/bin/sh
pnpm typecheck
```

Create pre-push hook:
```bash
echo '#!/bin/sh\npnpm typecheck' > .husky/pre-push
chmod +x .husky/pre-push
```

### Monorepo Setup

For Turborepo projects, scope checks to affected packages:

#### .husky/pre-commit

```bash
#!/bin/sh
pnpm lint-staged
pnpm turbo typecheck --filter='...[HEAD^]'
```

This only typechecks packages affected by the current commit.

### Skipping Hooks (Escape Hatch)

When you need to commit WIP code:

```bash
git commit --no-verify -m "WIP: work in progress"
```

Use sparingly. CI should still catch issues.

## VS Code Integration

Install the Biome extension, then add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

## Ignoring Files

In `biome.json`:

```json
{
  "extends": ["ultracite"],
  "files": {
    "ignore": [
      "node_modules",
      ".next",
      "dist",
      "drizzle"
    ]
  }
}
```

## Custom Overrides

```json
{
  "extends": ["ultracite"],
  "linter": {
    "rules": {
      "complexity": {
        "noForEach": "warn"
      }
    }
  },
  "formatter": {
    "lineWidth": 100
  }
}
```

## Migration from ESLint + Prettier

1. Remove old dependencies:
```bash
pnpm remove eslint prettier eslint-config-next @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

2. Remove old config files:
```bash
rm .eslintrc* .prettierrc* eslint.config.* prettier.config.*
```

3. Install Biome:
```bash
pnpm add -D @biomejs/biome ultracite
pnpm exec ultracite init
```

4. Update scripts:
```json
{
  "lint": "biome check src --write",
  "format": "biome format src --write"
}
```

5. Run initial fix:
```bash
pnpm exec ultracite fix
```

## Troubleshooting

### "Cannot find configuration"

```bash
pnpm exec ultracite doctor
```

### Conflicts with other formatters

Disable other formatters in VS Code:
```json
{
  "prettier.enable": false,
  "eslint.enable": false
}
```

### Specific file issues

Check with verbose output:
```bash
pnpm exec biome check src/problem-file.ts --verbose
```

### Tailwind v4 CSS Directives

Biome 2.3+ supports parsing Tailwind v4 CSS directives (`@theme`, `@source`, etc.):

```bash
pnpm exec biome check src --css-parse-tailwind-directives
```

Or in `biome.json`:
```json
{
  "css": {
    "parser": {
      "tailwindCssDirectives": true
    }
  }
}
```
