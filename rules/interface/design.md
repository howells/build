# Interface: Design

Source references:
- Vercel Design – Web Interface Guidelines: https://vercel.com/design/guidelines
- Web Interface Guidelines: https://github.com/vercel-labs/web-interface-guidelines

## Visual Design
- SHOULD: Layered shadows (ambient + direct)
  - *Example:* `shadow-[0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.1)]`
- SHOULD: Crisp edges via semi-transparent borders + shadows
  - *Example:* `border border-black/5 dark:border-white/10`
- SHOULD: Nested radii: child ≤ parent; concentric
  - *Math:* `outerRadius - padding = innerRadius`
- SHOULD: Hue consistency: tint borders/shadows/text toward bg hue
- MUST: Accessible charts (color-blind-friendly palettes)
- MUST: Meet contrast—prefer APCA over WCAG 2
  - https://apcacontrast.com/
- MUST: Increase contrast on `:hover/:active/:focus`
- SHOULD: Match browser UI to bg
- SHOULD: Avoid gradient banding (use masks when needed)

