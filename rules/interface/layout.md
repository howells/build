# Interface: Layout

Source references:
- Vercel Design – Web Interface Guidelines: https://vercel.com/design/guidelines
- Web Interface Guidelines: https://github.com/vercel-labs/web-interface-guidelines

## Principles
- SHOULD: Optical alignment; adjust by ±1px when perception beats geometry
- MUST: Deliberate alignment to grid/baseline/edges/optical centers—no accidental placement
- SHOULD: Balance icon/text lockups (stroke/weight/size/spacing/color)
- MUST: Verify mobile, laptop, ultra-wide (simulate ultra-wide at 50% zoom)
- MUST: Respect safe areas (use `env(safe-area-inset-*)`)
- MUST: Avoid unwanted scrollbars; fix overflows
