# Design System

Use layout primitives instead of raw HTML with utility classes. Components like `Stack`, `Text`, and `Grid` provide consistent spacing, responsive behavior, and semantic props that are easier to read and maintain.

## Philosophy

Prefer design system primitives over raw HTML:

```tsx
// Avoid: Raw HTML with utility classes
<div className="flex flex-col gap-4 md:flex-row md:gap-6">
  <p className="text-sm text-gray-600">Description</p>
</div>

// Prefer: Design system components
<Stack direction={{ base: "column", md: "row" }} gap={{ base: "4", md: "6" }}>
  <Text variant="muted" size="sm">Description</Text>
</Stack>
```

Benefits:
- **Consistency**: Spacing and typography follow a defined scale
- **Responsive**: Built-in responsive props, no media query classes
- **Readable**: Props describe intent, not implementation
- **Maintainable**: Change design tokens in one place

## Layout Primitives

### Stack

Vertical or horizontal layout with consistent spacing.

```tsx
import { Stack, VStack, HStack } from "@/components/ui/stack";

// Vertical stack (default)
<Stack gap="4">
  <Card />
  <Card />
</Stack>

// Horizontal stack
<HStack gap="4" align="center">
  <Avatar />
  <Text>Username</Text>
</HStack>

// Responsive direction
<Stack direction={{ base: "column", md: "row" }} gap="4">
  <Sidebar />
  <Content />
</Stack>
```

Props:
- `direction`: `"column"` | `"row"` (responsive)
- `gap`: Spacing scale token (responsive)
- `align`: Cross-axis alignment (responsive)
- `justify`: Main-axis distribution (responsive)
- `asChild`: Merge props onto child element

### Flex

Low-level flexbox control when Stack is too opinionated.

```tsx
import { Flex } from "@/components/ui/flex";

<Flex
  direction={{ base: "column", md: "row" }}
  justify="space-between"
  align="center"
  wrap="wrap"
  gap="4"
>
  {items.map(item => <Item key={item.id} />)}
</Flex>
```

### Grid

CSS Grid layouts with responsive column control.

```tsx
import { Grid, GridItem } from "@/components/ui/grid";

// Fixed columns
<Grid columns={3} gap="4">
  <Card />
  <Card />
  <Card />
</Grid>

// Responsive columns
<Grid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
  {products.map(p => <ProductCard key={p.id} />)}
</Grid>

// Spanning items
<Grid columns={4} gap="4">
  <GridItem colSpan={2}>Wide card</GridItem>
  <GridItem>Card</GridItem>
  <GridItem>Card</GridItem>
</Grid>
```

### SimpleGrid

Auto-fit grid that adapts to available space.

```tsx
import { SimpleGrid } from "@/components/ui/simple-grid";

<SimpleGrid minChildWidth="250px" gap="4">
  {items.map(item => <Card key={item.id} />)}
</SimpleGrid>
```

### Container

Max-width wrapper with responsive padding.

```tsx
import { Container } from "@/components/ui/container";

<Container size="lg" padding="6">
  <PageContent />
</Container>
```

Sizes: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px)

### Center

Center content horizontally and vertically.

```tsx
import { Center } from "@/components/ui/center";

<Center className="h-screen">
  <LoginForm />
</Center>

// Inline centering
<Center inline>
  <Icon name="check" />
  <Text>Verified</Text>
</Center>
```

### Space

Spacer element for pushing content apart.

```tsx
import { Space } from "@/components/ui/space";

<HStack>
  <Logo />
  <Space /> {/* Pushes nav to the right */}
  <Nav />
</HStack>
```

## Typography

### Text

Body text with semantic variants.

```tsx
import { Text } from "@/components/ui/text";

<Text>Default body text</Text>
<Text variant="muted">Secondary text</Text>
<Text variant="error">Error message</Text>
<Text size="sm">Small text</Text>
<Text size="lg" weight="medium">Large medium text</Text>
```

Props:
- `variant`: `"default"` | `"muted"` | `"error"` | `"success"`
- `size`: `"xs"` | `"sm"` | `"base"` | `"lg"` | `"xl"`
- `weight`: `"normal"` | `"medium"` | `"semibold"` | `"bold"`
- `asChild`: Merge props onto child element

### Heading

Semantic headings with visual sizing.

```tsx
import { Heading } from "@/components/ui/heading";

<Heading level="h1">Page Title</Heading>
<Heading level="h2" size="lg">Section Title</Heading>
<Heading level="h3" size="base">Subsection</Heading>
```

Decouples semantic level (`h1`-`h6`) from visual size. Use the correct heading level for accessibility, adjust size visually as needed.

## Responsive Props

Layout primitives accept responsive values as objects with breakpoint keys:

```tsx
// Single value (all breakpoints)
<Stack gap="4" />

// Responsive object
<Stack
  gap={{ base: "2", md: "4", lg: "6" }}
  direction={{ base: "column", md: "row" }}
/>
```

Breakpoints:
- `base`: Default (mobile-first)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

The responsive system generates appropriate Tailwind classes for each breakpoint.

## When to Use Raw Classes

Use design system components by default. Use raw Tailwind classes for:

- **One-off positioning**: `absolute`, `fixed`, positioning utilities
- **Decorative styling**: Borders, shadows, background colors not covered by props
- **Complex animations**: Custom keyframes, transforms
- **Third-party integration**: Styling components that don't accept design system wrappers

```tsx
// Good: Component props for layout, classes for decoration
<Stack gap="4" className="rounded-lg border p-6 shadow-sm">
  <Heading level="h2">Card Title</Heading>
  <Text variant="muted">Card content</Text>
</Stack>
```

---

## Storybook

Storybook documents and tests UI components in isolation. Run it during development to build and verify components before integrating into apps.

### Installation

```bash
# For a new package
pnpm add -D storybook @storybook/react-vite

# Initialize
pnpm storybook init
```

### Monorepo Setup

In a monorepo, create a dedicated Storybook app that pulls stories from UI packages:

```
apps/
├── storybook/
│   ├── .storybook/
│   │   ├── main.ts
│   │   └── preview.tsx
│   └── package.json
packages/
├── ui/
│   └── src/
│       └── components/
│           └── button/
│               ├── button.tsx
│               └── button.stories.tsx
```

#### .storybook/main.ts

```ts
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    // Local stories
    "../src/**/*.stories.@(ts|tsx|mdx)",
    // UI package stories
    "../../../packages/ui/src/**/*.stories.@(ts|tsx|mdx)",
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: (viteConfig) => {
    // Allow monorepo paths
    viteConfig.server = viteConfig.server || {};
    viteConfig.server.fs = {
      allow: [
        ...(viteConfig.server?.fs?.allow ?? []),
        path.resolve(__dirname, "../../.."),
      ],
    };

    // Alias packages
    viteConfig.resolve = viteConfig.resolve || {};
    viteConfig.resolve.alias = {
      ...viteConfig.resolve.alias,
      "@project/ui": path.resolve(__dirname, "../../../packages/ui/src"),
      "@project/tailwind-config": path.resolve(
        __dirname,
        "../../../packages/tailwind-config"
      ),
    };

    return viteConfig;
  },
};

export default config;
```

#### .storybook/preview.tsx

```tsx
import "@project/tailwind-config/shared-styles.css";
import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "app",
      values: [
        { name: "app", value: "#f5f5f5" },
        { name: "dark", value: "#1a1a1a" },
        { name: "white", value: "#ffffff" },
      ],
    },
    actions: {
      argTypesRegex: "^on.*",
    },
  },
  tags: ["autodocs"],
};

export default preview;
```

### Writing Stories

Co-locate stories with components:

```
components/
├── button/
│   ├── button.tsx
│   └── button.stories.tsx
```

#### Component Story Pattern

```tsx
// button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "ghost"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    children: "Button",
    variant: "default",
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Base interactive story
export const Default: Story = {};

// Variant stories
export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Destructive: Story = {
  args: { variant: "destructive" },
};

// State stories
export const Disabled: Story = {
  args: { disabled: true },
};

// Composition stories
export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <PlusIcon className="mr-2 h-4 w-4" />
      Add Item
    </Button>
  ),
};
```

#### Layout Component Stories

For layout components, show matrices of variants:

```tsx
// stack.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "./stack";
import { Text } from "../text";

const meta: Meta<typeof Stack> = {
  title: "Layout/Stack",
  component: Stack,
  argTypes: {
    direction: {
      control: "select",
      options: ["column", "row"],
    },
    gap: {
      control: "select",
      options: ["2", "4", "6", "8"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Stack {...args}>
      <Text className="rounded bg-gray-100 p-2">Item 1</Text>
      <Text className="rounded bg-gray-100 p-2">Item 2</Text>
      <Text className="rounded bg-gray-100 p-2">Item 3</Text>
    </Stack>
  ),
};

export const GapMatrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-4 gap-8">
      {["2", "4", "6", "8"].map((gap) => (
        <div key={gap}>
          <Text size="sm" variant="muted" className="mb-2">gap={gap}</Text>
          <Stack gap={gap as any}>
            <div className="rounded bg-gray-200 p-2">A</div>
            <div className="rounded bg-gray-200 p-2">B</div>
            <div className="rounded bg-gray-200 p-2">C</div>
          </Stack>
        </div>
      ))}
    </div>
  ),
};
```

### Recommended Addons

```json
{
  "devDependencies": {
    "storybook": "^10.0.0",
    "@storybook/react-vite": "^10.0.0",
    "@storybook/addon-docs": "^10.0.0",
    "@storybook/addon-a11y": "^10.0.0",
    "@storybook/addon-vitest": "^10.0.0"
  }
}
```

- **addon-docs**: Auto-generated documentation from stories
- **addon-a11y**: Accessibility auditing in the UI
- **addon-vitest**: Run component tests alongside stories

### Scripts

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build:storybook": "storybook build"
  }
}
```

### Best Practices

1. **Co-locate stories** with components, not in a separate folder
2. **One default export** per story file with component metadata
3. **Named exports** for each story variant
4. **Use argTypes** to control which props appear in the controls panel
5. **Matrix stories** for layout/variant combinations (gaps, sizes, colors)
6. **Test in Storybook first**, then integrate into apps
7. **Import shared styles** in preview.tsx so Tailwind works
