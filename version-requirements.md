# Version Requirements

Minimum and mandatory versions for new projects as of January 2026.

## Mandatory Versions (Non-Negotiable)

These versions are **required** for all new projects. Do not use older versions.

| Package | Minimum | Current | Rationale |
|---------|---------|---------|-----------|
| next | **16.0.0** | 16.1.x | Turbopack stable, improved caching, React 19 support |
| react | **19.0.0** | 19.2.x | ref-as-prop, no forwardRef, use() hook |
| typescript | **5.8.0** | 5.9.x | Improved inference, config inheritance |
| node | **20.9.0** | 22.x | Required by Next.js 16 |
| tailwindcss | **4.0.0** | 4.1.x | Config-free, CSS-first, smaller bundles |
| @biomejs/biome | **2.0.0** | 2.3.x | ESLint/Prettier replacement |
| zod | **4.0.0** | 4.x | Breaking changes from v3, better inference |
| @tanstack/react-query | **5.0.0** | 5.90.x | Suspense-first, streaming |
| @trpc/server | **11.0.0** | 11.x | Breaking API changes from v10 |

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
