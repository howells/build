# Zustand

Lightweight state management for React. Use for UI state that needs to persist or be shared across components.

## When to Use Zustand vs React Context

| Use Case | Solution |
|----------|----------|
| Theme, auth, locale (rarely changes) | React Context |
| Dependency injection (db, api clients) | React Context |
| UI preferences (sidebar pinned, view mode) | Zustand + persist |
| Complex component state (carousel, forms) | Zustand |
| Frequently updating state | Zustand (avoids re-render cascade) |
| State that survives page refresh | Zustand + persist |

**Rule of thumb**: If it changes often or needs localStorage, use Zustand. If it's mostly static config or dependency injection, use Context.

## Installation

```bash
pnpm add zustand
```

## Basic Store

```ts
// stores/cart-store.ts
import { create } from "zustand";

interface CartState {
  items: string[];
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (id) => set((state) => ({ items: [...state.items, id] })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((i) => i !== id)
  })),
  clear: () => set({ items: [] }),
}));
```

## With Persist (localStorage)

```ts
// stores/sidebar-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isPinned: boolean;
  isExpanded: boolean;
  togglePinned: () => void;
  setExpanded: (expanded: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isPinned: false,
      isExpanded: false,
      togglePinned: () => set((state) => ({ isPinned: !state.isPinned })),
      setExpanded: (expanded) => set({ isExpanded: expanded }),
    }),
    {
      name: "sidebar-state", // localStorage key
    }
  )
);
```

### Partial Persistence

Only persist what matters:

```ts
persist(
  (set, get) => ({
    isPinned: false,
    isHovering: false, // Don't persist this
    openItems: {},
    // ...actions
  }),
  {
    name: "sidebar-state",
    partialize: (state) => ({
      isPinned: state.isPinned,
      openItems: state.openItems,
      // isHovering excluded
    }),
  }
)
```

### Hydration Handling

Avoid flash of default state on page load:

```ts
interface SidebarState {
  isHydrated: boolean;
  // ...other state
}

persist(
  (set, get) => ({
    isHydrated: false,
    // ...
  }),
  {
    name: "sidebar-state",
    onRehydrateStorage: () => (state) => {
      if (state) {
        state.isHydrated = true;
      }
    },
  }
)
```

```tsx
// In component
const isHydrated = useSidebarStore((s) => s.isHydrated);
if (!isHydrated) return <SidebarSkeleton />;
```

## Selectors (Avoid Re-renders)

Always use selectors—don't subscribe to the whole store:

```tsx
// Bad: re-renders on ANY state change
const store = useCartStore();

// Good: only re-renders when items changes
const items = useCartStore((state) => state.items);
const addItem = useCartStore((state) => state.addItem);

// Good: multiple selectors
function CartCount() {
  const count = useCartStore((state) => state.items.length);
  return <span>{count}</span>;
}
```

### Selector Exports

Export selectors for reuse:

```ts
// stores/product-grid-store.ts
export const useProductGridStore = create<ProductGridState>()(
  subscribeWithSelector((set, get) => ({
    viewMode: "grid",
    setViewMode: (viewMode) => set({ viewMode }),
  }))
);

// Selector exports
export const selectViewMode = (state: ProductGridState) => state.viewMode;

// Usage
const viewMode = useProductGridStore(selectViewMode);
```

## subscribeWithSelector

Enables subscribing to specific state slices outside React:

```ts
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export const useFilterStore = create<FilterState>()(
  subscribeWithSelector((set) => ({
    filters: {},
    setFilter: (key, value) => set((state) => ({
      filters: { ...state.filters, [key]: value }
    })),
  }))
);

// Subscribe outside React (e.g., in an effect or util)
useFilterStore.subscribe(
  (state) => state.filters,
  (filters) => {
    console.log("Filters changed:", filters);
  }
);
```

## Computed Values with get()

Use `get()` for computed properties:

```ts
const useSidebarStore = create<SidebarState>()((set, get) => ({
  state: "collapsed",
  isHovering: false,

  get isExpanded() {
    const { state, isHovering } = get();
    return state === "pinned" || state === "open" || isHovering;
  },

  get effectiveWidth() {
    return get().isExpanded
      ? "var(--sidebar-open-width)"
      : "var(--sidebar-collapsed-width)";
  },
}));
```

## File Organization

Colocate stores with their consumers:

```
features/
├── cart/
│   ├── components/
│   ├── stores/
│   │   └── cart-store.ts      # Feature-specific store
│   └── hooks/
├── search/
│   ├── components/
│   ├── stores/
│   │   ├── filter-store.ts
│   │   └── results-store.ts
│   └── hooks/
└── ...

stores/                         # App-wide stores (if any)
└── ui-store.ts
```

**Principle**: Keep stores small and feature-local. Don't create a global store package—each feature owns its state.

## Common Patterns

### Toggle with Same-Value Detection

```ts
// Toggle off when clicking the same value
set: (key, edit) => {
  set((state) => {
    const current = state.changes[key];
    const isSame = current?.kind === edit.kind;

    if (isSame) {
      // Remove the edit (toggle off)
      const { [key]: _, ...rest } = state.changes;
      return { changes: rest };
    }

    // Set/replace the edit
    return { changes: { ...state.changes, [key]: edit } };
  });
}
```

### Dynamic Collection Creation

```ts
createCollection: (name) => {
  const id = slugify(name);

  if (get().collections.some((c) => c.id === id)) {
    return id; // Already exists
  }

  set((state) => ({
    collections: [...state.collections, { id, name, count: 0 }],
  }));

  return id;
}
```

### Soft Delete (Avoid Layout Shift)

```ts
interface CarouselState {
  slides: Slide[];
  deletedIds: Set<string>;
  deleteById: (id: string) => void;
}

// Filter in render, don't remove from array
const visibleSlides = slides.filter((s) => !deletedIds.has(s.id));
```

## What NOT to Use Zustand For

- **Server state** → Use TanStack Query
- **Form state** → Use react-hook-form or native forms
- **URL state** → Use nuqs or searchParams
- **Auth state** → Use Clerk's hooks
- **Static config** → Use React Context
