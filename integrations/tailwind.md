# Tailwind CSS v4

Tailwind v4 is config-free by default. All configuration happens in CSS using `@theme` directives.

## Installation

```bash
pnpm add tailwindcss@4 @tailwindcss/postcss@4
pnpm add -D tailwind-merge class-variance-authority clsx
```

## Single App Setup

### postcss.config.js

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### globals.css

```css
@import "tailwindcss";

@source "../**/*.{ts,tsx}";
```

The `@source` directive tells Tailwind where to scan for class names. Without it, classes won't be generated.

## Monorepo Setup

In a monorepo, you'll typically have:
- A shared **UI package** (`packages/ui`) with reusable components
- **Apps** that consume the UI package

### Option 1: Tailwind in Each App (Recommended)

Each app owns its Tailwind configuration. The UI package exports unstyled or minimally-styled components.

```
packages/
├── ui/
│   ├── src/
│   │   ├── button.tsx
│   │   └── index.ts
│   └── package.json
apps/
├── web/
│   ├── src/
│   │   ├── app/
│   │   └── globals.css      # Tailwind here
│   └── postcss.config.js
```

**apps/web/globals.css:**

```css
@import "tailwindcss";

/* Scan local app code */
@source "../src/**/*.{ts,tsx}";

/* Scan UI package for class names */
@source "../../packages/ui/src/**/*.{ts,tsx}";
```

This approach is simpler—each app controls its own styling and can customize tokens independently.

### Option 2: Shared Tailwind Config Package

For strict design system consistency, create a shared config package.

```
packages/
├── tailwind-config/
│   ├── src/
│   │   ├── base.css         # Shared tokens and theme
│   │   └── index.ts
│   └── package.json
├── ui/
│   └── src/
│       └── button.tsx
apps/
├── web/
│   ├── src/
│   │   └── globals.css
│   └── postcss.config.js
```

**packages/tailwind-config/src/base.css:**

```css
@import "tailwindcss";

@theme {
  /* Design system tokens */
  --color-primary: oklch(0.65 0.2 250);
  --color-primary-foreground: oklch(0.98 0 0);
  --color-secondary: oklch(0.55 0.05 250);
  --color-secondary-foreground: oklch(0.98 0 0);
  --color-destructive: oklch(0.55 0.2 25);
  --color-destructive-foreground: oklch(0.98 0 0);

  /* Semantic colors */
  --color-background: oklch(0.99 0 0);
  --color-foreground: oklch(0.1 0 0);
  --color-muted: oklch(0.95 0.01 250);
  --color-muted-foreground: oklch(0.45 0.02 250);
  --color-border: oklch(0.9 0.01 250);
  --color-input: oklch(0.9 0.01 250);
  --color-ring: oklch(0.65 0.2 250);

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}
```

**packages/tailwind-config/package.json:**

```json
{
  "name": "@project/tailwind-config",
  "exports": {
    "./base.css": "./src/base.css"
  }
}
```

**apps/web/globals.css:**

```css
@import "@project/tailwind-config/base.css";

/* App-specific source paths */
@source "../src/**/*.{ts,tsx}";
@source "../../packages/ui/src/**/*.{ts,tsx}";

/* App-specific overrides (optional) */
@theme {
  --color-primary: oklch(0.6 0.25 150);  /* Different brand color */
}
```

## Theme Tokens

### Color System

Use CSS custom properties with `@theme` mapping:

```css
@theme {
  /* Map CSS variables to Tailwind utilities */
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
}
```

Now `bg-primary`, `text-muted-foreground`, `border-input` all work.

### Dark Mode

Use CSS variables that change with a class or media query:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
}

@theme {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
}
```

## Utility Libraries

### cn() Function

Combine `clsx` and `tailwind-merge` for conditional classes:

```ts
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Usage:

```tsx
<div className={cn(
  "rounded-lg border p-4",
  isActive && "border-primary bg-primary/10",
  className
)} />
```

### class-variance-authority (CVA)

Create component variants:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

## Common Patterns

### Container with Max Width

```tsx
<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
  {children}
</div>
```

### Card Component

```tsx
<div className="rounded-lg border bg-card p-6 shadow-sm">
  <h3 className="text-lg font-semibold">{title}</h3>
  <p className="mt-2 text-muted-foreground">{description}</p>
</div>
```

### Responsive Grid

```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => (
    <Card key={item.id} {...item} />
  ))}
</div>
```

## Troubleshooting

### Classes Not Being Generated

If utilities like `bg-primary` or custom spacing aren't working:

1. **Check `@source` paths** — Tailwind only scans paths you specify
2. **Check `@theme` mapping** — Custom colors need explicit mapping
3. **Clear cache** — Delete `.next` and restart dev server

### Debug Source Scanning

Add verbose output to see what's being scanned:

```bash
DEBUG=tailwindcss:* pnpm dev
```

## Key Differences from v3

| v3 | v4 |
|----|-----|
| `tailwind.config.js` | CSS `@theme` directives |
| `content: [...]` in config | `@source` directives in CSS |
| `theme.extend.colors` | `@theme { --color-*: ... }` |
| `@apply` encouraged | Prefer `cn()` and composition |
| Plugin ecosystem | Native CSS features |
