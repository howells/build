# Version Requirements

Minimum and mandatory versions for new projects as of January 2026.

## Mandatory Versions

**The authoritative list of minimum version requirements is maintained in [rules/versions.md](./rules/versions.md).**

Refer to that file for the strict "MUST" constraints enforced by AI agents. The section below explains the *reasoning* behind these choices.

### Rationale & Key Drivers

| Package | Why Update? |
|---------|-------------|
| **next** | Turbopack stable, async params/headers, `use cache` directive |
| **react** | `ref` as prop (no `forwardRef`), `use()` hook, Server Components |
| **typescript** | Config inheritance, improved inference, performance |
| **node** | Required runtime for Next.js 16+ |
| **tailwindcss** | v4 is config-free, CSS-first, and significantly faster |
| **zod** | v4 introduces breaking inference changes and better optionality handling |
| **biome** | Replaces ESLint/Prettier with a single, faster tool |

## Breaking Changes to Know

### Next.js 15 → 16
- `next/headers` and `next/cookies` are now async (must await)
- `params` and `searchParams` in page/layout are now Promises
- Turbopack is default for dev (`next dev` uses Turbopack)
- New `next.config.ts` support (TypeScript config)
- **`proxy.ts` replaces `middleware.ts`** - Security-driven rename, Node.js runtime only
- **`use cache` directive** - New explicit opt-in caching model
- Edge runtime removed for proxy functions

```tsx
// Old (Next 15)
export default function Page({ params }: { params: { id: string } }) {
  return <div>{params.id}</div>
}

// New (Next 16)
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <div>{id}</div>
}
```

### React 18 → 19
- No more `forwardRef`—ref is a regular prop
- `use()` hook for reading promises and context
- Actions for form handling (`useActionState`, `useFormStatus`)
- `<Context>` replaces `<Context.Provider>`

```tsx
// Old (React 18)
const Input = forwardRef<HTMLInputElement, Props>((props, ref) => (
  <input ref={ref} {...props} />
))

// New (React 19)
function Input({ ref, ...props }: Props & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />
}
```

### Tailwind v3 → v4
- No `tailwind.config.js`—all config in CSS
- Use `@theme` for design tokens, `@source` for content paths
- PostCSS plugin changed to `@tailwindcss/postcss`
- Only `gray-*` palette (not slate/zinc/neutral)
- Native CSS cascade layers

```css
/* app/globals.css - Tailwind v4 */
@import 'tailwindcss';

@source '../components/**/*.tsx';
@source '../app/**/*.tsx';

@theme {
  --font-sans: 'Inter', sans-serif;
  --color-primary: oklch(0.7 0.15 250);
}
```

### Zod 3 → 4
- `z.interface()` for key-optional vs value-optional distinction
- Recursive types with getters (no more `z.lazy()` workarounds)
- Unified error customization API
- Breaking: `.catch()` and `.default()` on optional properties always return caught values

```ts
// Zod 4 key optionality
const schema = z.interface({
  "name?": z.string(),         // key optional: { name?: string }
  email: z.string().optional() // value optional: { email: string | undefined }
});

// Recursive types with getters
const Category = z.interface({
  name: z.string(),
  get subcategories() {
    return z.array(Category);
  },
});
```

### tRPC 10 → 11
- New `initTRPC` API
- React Query 5 integration required
- Simplified client setup
- Breaking: procedure builder changes

## Recommended Versions (Strongly Preferred)

| Package | Version | Notes |
|---------|---------|-------|
| turbo | 2.7+ | Improved caching |
| drizzle-orm | 0.45+ | Latest schema API |
| @clerk/nextjs | 6+ | Next.js 16 support |
| framer-motion | 12+ | Smaller bundle, new API |
| playwright | 1.57+ | Latest browser engines |
| vitest | 4+ | Faster, better ESM |

## Version Checking Commands

```bash
# Check outdated packages
pnpm outdated

# Update all packages interactively
pnpm update -i --latest

# Check specific package version
pnpm why next

# Audit for vulnerabilities
pnpm audit
```

## Package.json Template

```json
{
  "engines": {
    "node": ">=20.9.0"
  },
  "packageManager": "pnpm@10.11.0"
}
```

## Upgrading Existing Projects

Priority order for upgrades:

1. **React 19** - Foundation for everything else
2. **Next.js 16** - Requires React 19
3. **Tailwind v4** - Independent, can do anytime
4. **Zod 4** - May require schema updates
5. **tRPC 11** - Requires Zod 4, React Query 5

### Codemod for Next.js Upgrade

```bash
# Run Next.js codemods (includes middleware → proxy.ts migration)
npx @next/codemod@latest upgrade latest
```

### Codemod for React 19

```bash
# Remove forwardRef usage
npx codemod react/19/replace-forward-ref
```
