# Interface: Content & Accessibility

Source references:
- Vercel Design – Web Interface Guidelines: https://vercel.com/design/guidelines
- Web Interface Guidelines: https://github.com/vercel-labs/web-interface-guidelines

## ARIA
- NEVER: Use `aria-hidden="true"` on focusable elements.
- MUST: Label elements need text and an associated input.
- MUST: All anchors must be valid and navigable.
- MUST: Accurate names (`aria-label`), decorative elements `aria-hidden`, verify in the Accessibility Tree.
- MUST: Icon-only buttons have descriptive `aria-label`.
- MUST: Prefer native semantics (`button`, `a`, `label`, `table`) before ARIA.

## Content & Accessibility
- SHOULD: Inline help first; tooltips last resort
- MUST: Skeletons mirror final content to avoid layout shift
- MUST: `<title>` matches current context
- MUST: No dead ends; always offer next step/recovery
- MUST: Design empty/sparse/dense/error states
- SHOULD: Curly quotes (" "); avoid widows/orphans
- MUST: Tabular numbers for comparisons (`font-variant-numeric: tabular-nums` or a mono like Geist Mono)
- MUST: Redundant status cues (not color-only); icons have text labels
- MUST: Don't ship the schema—visuals may omit labels but accessible names still exist
- MUST: Use the ellipsis character `…` (not `...`)
- MUST: `scroll-margin-top` on headings for anchored links; include a "Skip to content" link; hierarchical `<h1–h6>`
- MUST: Resilient to user-generated content (short/avg/very long)
- MUST: Locale-aware dates/times/numbers/currency
- SHOULD: Right-clicking the nav logo surfaces brand assets
- MUST: Use non-breaking spaces to glue terms: `10\u00A0MB`, `⌘\u00A0+\u00A0K`, `Vercel\u00A0SDK`
