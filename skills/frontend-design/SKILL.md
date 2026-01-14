# frontend-design
# Use when the user asks to design, redesign, or implement a frontend UI (component/page/app) and they want a visually distinctive, production-grade result (not generic “AI slop”), with deliberate typography, color, spacing, and motion choices.
# Skill-specific tools and reference files live in /Users/danielhowells/.codex/skills/frontend-design
# ============================================

# Frontend Design

Build distinctive, production-grade frontend interfaces that feel intentionally designed (not templated).

## Core Principle

Commit to a clear aesthetic direction before coding, then execute it with precision and restraint appropriate to that direction.

## Workflow

1. Confirm purpose, audience, and constraints (framework, design system, performance, accessibility, theming).
2. Choose one bold aesthetic direction (name it in a short phrase).
3. Define the “one memorable thing” (signature moment: layout move, typographic treatment, interaction, or detail).
4. Lock the system:
   - Type: font pairing (display + body), scale, line-height, letter-spacing.
   - Color: 1 dominant surface + 1 accent + neutrals; define tokens/variables.
   - Spacing: grid rhythm, corner radius rules, shadow language.
   - Motion: one primary transition style + reduced-motion variant.
5. Implement working code end-to-end (layout, states, empty/error, loading, hover/focus, keyboard).
6. Refine: optical alignment, spacing polish, contrast, focus rings, edge cases, responsiveness.

## Aesthetic Levers (Use Intentionally)

- Typography: make it the backbone. Use a characterful display face plus a readable body face; tune `font-variation-settings`, tracking, and `font-variant-numeric` when relevant.
- Color: prefer a confident palette (dominant surfaces + sharp accents) over evenly-distributed “safe” colors. Keep neutrals consistent.
- Composition: avoid default symmetry; try asymmetry, overlap, edge-to-edge moments, and deliberate negative space (or controlled density).
- Depth & texture: introduce atmosphere with subtle grain/noise, mesh gradients, tinted borders, layered transparencies, and crisp shadows (when aligned with the direction).
- Motion: invest in a few high-impact moments (load-in, section reveals, hover states). Animate `transform`/`opacity`; avoid layout-thrashing properties.

## Guardrails (Production Quality)

- Accessibility: ensure semantic structure, visible `:focus-visible`, keyboard navigation, and sufficient contrast. Do not rely on color alone for status cues.
- Responsiveness: verify small mobile, laptop, ultra-wide layouts; avoid accidental horizontal scroll.
- States: design empty/sparse/dense/error/loading states; avoid dead ends—always offer a next action.
- Reduced motion: honor `prefers-reduced-motion` with toned-down or disabled animations.
- Assets: use framework-native image/font tooling (e.g., `next/image`, `next/font`) when available; prefer self-hosting or licensed sources.

## Anti-Patterns (Avoid “AI Slop”)

- Default font stacks and overused “AI UI” choices (Inter/Roboto/system-by-default) unless the project explicitly requires them.
- Purple-on-white gradient hero + generic glassmorphism + perfectly centered layout with predictable cards.
- Copy-pasted component patterns with no context-specific detail or signature.
- Random micro-animations everywhere instead of one coherent motion language.

## Example Output Shape

When asked to build UI, produce:
- A named aesthetic direction (1 line)
- A short set of design tokens (type + color + spacing/motion notes)
- Working, production-ready code with key states and accessibility baked in
