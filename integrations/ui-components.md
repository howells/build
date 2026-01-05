# UI Components

Use shadcn for scaffolding components, prefer Base UI primitives over Radix. Components are copied into your project—you own and customize them.

## Philosophy

```
shadcn (scaffolding) → Base UI (primitives) → Tailwind (styling)
```

1. **shadcn generates code** — Not a dependency; components live in your repo
2. **Base UI over Radix** — Truly unstyled, smaller bundle, better TypeScript
3. **Style with Tailwind** — Use CVA for variants, cn() for merging

## Installation

```bash
pnpm add clsx tailwind-merge class-variance-authority

# Base UI primitives (as needed)
pnpm add @base-ui-components/react

# Legacy Radix (only when Base UI lacks the primitive)
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```

### Utility Functions

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## shadcn Setup

```bash
pnpm dlx shadcn@latest init
```

Configuration options:
- Style: Default
- Base color: Neutral
- CSS variables: Yes
- Tailwind CSS config: No (v4 uses CSS)
- Components location: `src/components/ui`
- Utility location: `src/lib/utils`

Add components:

```bash
pnpm dlx shadcn@latest add button card dialog
```

## Base UI vs Radix

Prefer Base UI when available:

| Component | Use | Package |
|-----------|-----|---------|
| Checkbox | Base UI | `@base-ui-components/react` |
| Dialog/Modal | Base UI | `@base-ui-components/react` |
| Menu/Dropdown | Base UI | `@base-ui-components/react` |
| Popover | Base UI | `@base-ui-components/react` |
| Select | Base UI | `@base-ui-components/react` |
| Slider | Base UI | `@base-ui-components/react` |
| Switch | Base UI | `@base-ui-components/react` |
| Tabs | Base UI | `@base-ui-components/react` |
| Tooltip | Base UI | `@base-ui-components/react` |
| Accordion | Radix | `@radix-ui/react-accordion` |
| Context Menu | Radix | `@radix-ui/react-context-menu` |
| Toast | Sonner | `sonner` |
| Command | cmdk | `cmdk` |
| Drawer | Vaul | `vaul` |

### Base UI Example

```tsx
// src/components/ui/checkbox.tsx
import { Checkbox as BaseCheckbox } from "@base-ui-components/react/checkbox";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  disabled,
  className,
}: CheckboxProps) {
  return (
    <BaseCheckbox.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        "h-4 w-4 rounded border border-input",
        "data-[checked]:bg-primary data-[checked]:border-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      <BaseCheckbox.Indicator className="flex items-center justify-center text-primary-foreground">
        <CheckIcon className="h-3 w-3" />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}
```

Base UI advantages:
- No CSS reset battles (truly unstyled)
- Data attributes for styling (`data-[state]`)
- Smaller bundle size
- Better TypeScript inference

## Component Variants with CVA

```tsx
// src/components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
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

export { buttonVariants };
```

## Component Structure

Organize complex components in folders:

```
src/components/ui/
├── button.tsx           # Simple component
├── card/                # Complex component
│   ├── card.tsx         # Barrel file (exports)
│   ├── card-root.tsx
│   ├── card-header.tsx
│   ├── card-title.tsx
│   ├── card-content.tsx
│   └── card-footer.tsx
└── dialog/
    ├── dialog.tsx
    ├── dialog-root.tsx
    ├── dialog-trigger.tsx
    ├── dialog-content.tsx
    └── dialog-close.tsx
```

### Barrel File Pattern

```tsx
// src/components/ui/card/card.tsx
export { Card } from "./card-root";
export { CardHeader } from "./card-header";
export { CardTitle } from "./card-title";
export { CardContent } from "./card-content";
export { CardFooter } from "./card-footer";
```

Import from barrel:

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card/card";
```

## Icons

Use Lucide React for icons:

```bash
pnpm add lucide-react
```

```tsx
import { Check, X, ChevronDown } from "lucide-react";

<Button>
  <Check className="mr-2 h-4 w-4" />
  Confirm
</Button>
```

Add to `next.config.ts` for tree-shaking:

```ts
experimental: {
  optimizePackageImports: ["lucide-react"],
}
```

## Toasts with Sonner

```bash
pnpm add sonner
```

```tsx
// src/components/ui/sonner.tsx
"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "bg-background text-foreground border-border",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}
```

```tsx
// In layout
<Toaster />

// Usage
import { toast } from "sonner";

toast.success("Changes saved");
toast.error("Something went wrong");
toast.loading("Saving...");
```

## Command Palette with cmdk

```bash
pnpm add cmdk
```

```tsx
import { Command } from "cmdk";

export function CommandMenu() {
  return (
    <Command className="rounded-lg border shadow-md">
      <Command.Input placeholder="Type a command..." />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        <Command.Group heading="Actions">
          <Command.Item onSelect={() => console.log("New file")}>
            New File
          </Command.Item>
          <Command.Item onSelect={() => console.log("Search")}>
            Search
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command>
  );
}
```

## Drawer with Vaul

```bash
pnpm add vaul
```

```tsx
import { Drawer } from "vaul";

export function MobileMenu() {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <Button variant="ghost" size="icon">
          <MenuIcon />
        </Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 rounded-t-xl bg-background p-4">
          <Drawer.Handle className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />
          {/* Menu content */}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

## Best Practices

1. **Check Base UI first** — Only use Radix when Base UI lacks the primitive
2. **Use CVA for variants** — Type-safe, composable variant definitions
3. **cn() for class merging** — Always merge classes properly
4. **Folder structure for complex components** — Barrel files + part components
5. **Data attributes for state** — `data-[state=open]` over conditional classes
6. **Customize shadcn freely** — It's your code, not a dependency
7. **Tree-shake icons** — Add lucide-react to optimizePackageImports
