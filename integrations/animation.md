# Animation

Motion (formerly Framer Motion) for React animations. Use CSS transitions for simple cases, Motion for complex orchestration.

## Installation

```bash
# Full library
pnpm add motion

# Or lighter alternative (same API, smaller bundle)
pnpm add motion
```

Both packages share the same API. Use `motion` for new projects.

## Basic Usage

### Animate on Mount

```tsx
import { motion } from "motion/react";

export function FadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

### Exit Animations

Wrap with `AnimatePresence` for exit animations:

```tsx
import { motion, AnimatePresence } from "motion/react";

export function Modal({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Hover & Tap

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
>
  Click me
</motion.button>
```

## Variants

Define animation states as objects:

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function StaggeredList({ items }: { items: string[] }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.li key={item} variants={itemVariants}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

## Layout Animations

Animate layout changes automatically:

```tsx
<motion.div layout className="grid grid-cols-3 gap-4">
  {items.map((item) => (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="rounded-lg bg-card p-4"
    >
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

### Shared Layout Animations

```tsx
<motion.div layoutId={`card-${id}`}>
  {/* Content animates between positions */}
</motion.div>
```

## Scroll Animations

### Scroll-triggered

```tsx
import { motion, useInView } from "motion/react";
import { useRef } from "react";

export function FadeInOnScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
```

### Scroll Progress

```tsx
import { motion, useScroll, useTransform } from "motion/react";

export function ParallaxHero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <motion.div style={{ y, opacity }} className="h-screen">
      <h1>Hero Content</h1>
    </motion.div>
  );
}
```

## Gestures

### Drag

```tsx
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
  dragElastic={0.1}
  className="h-20 w-20 cursor-grab rounded-lg bg-primary active:cursor-grabbing"
/>
```

### Pan

```tsx
<motion.div
  onPan={(e, info) => console.log(info.offset)}
  onPanEnd={(e, info) => console.log("Pan ended", info.velocity)}
/>
```

## Animation Controls

Programmatic control:

```tsx
import { motion, useAnimationControls } from "motion/react";

export function ControlledAnimation() {
  const controls = useAnimationControls();

  const handleClick = async () => {
    await controls.start({ scale: 1.2 });
    await controls.start({ scale: 1 });
  };

  return (
    <motion.div animate={controls} onClick={handleClick}>
      Click to bounce
    </motion.div>
  );
}
```

## Reduced Motion

Always respect user preferences:

```tsx
import { motion, useReducedMotion } from "motion/react";

export function AccessibleAnimation({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

Or globally with CSS:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Common Patterns

### Page Transitions

```tsx
// src/components/page-transition.tsx
"use client";

import { motion } from "motion/react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

### Staggered List

```tsx
export function StaggeredFadeIn({ children }: { children: React.ReactNode[] }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: 0.05 },
        },
      }}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Expandable Card

```tsx
export function ExpandableCard({ title, content }: { title: string; content: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      layout
      onClick={() => setIsOpen(!isOpen)}
      className="cursor-pointer rounded-lg bg-card p-4"
    >
      <motion.h3 layout="position">{title}</motion.h3>
      <AnimatePresence>
        {isOpen && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {content}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

## CSS Transitions First

For simple cases, prefer CSS:

```tsx
// Simple hover effect - use CSS
<button className="transition-colors hover:bg-primary/90">
  Click me
</button>

// Simple fade - use CSS
<div className="animate-in fade-in duration-300">
  Content
</div>
```

Use Motion when you need:
- Exit animations
- Gesture-based animations
- Layout animations
- Scroll-linked animations
- Complex orchestration (variants, stagger)
- Spring physics

## Best Practices

1. **CSS first** — Use Tailwind transitions for simple cases
2. **Respect reduced motion** — Check `useReducedMotion` or use CSS media query
3. **AnimatePresence for exits** — Required for exit animations
4. **layout prop for position changes** — Auto-animate layout shifts
5. **Variants for complex animations** — Cleaner than inline objects
6. **Avoid animating width/height** — Animate scale/transform instead (better performance)
7. **Use once: true for scroll reveals** — Don't re-animate on scroll back
