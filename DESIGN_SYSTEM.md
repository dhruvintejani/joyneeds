# JoyNeeds visual system

The storefront has **one authored visual theme**, \`frontend/src/studio.css\`.
The base \`index.css\`, \`reference.css\`, and \`auth/auth.css\` provide structural
layout/compatibility; they should not be used to layer additional competing
themes. Admin components retain their own structural CSS with theme overrides
centralized in \`studio.css\`.

## Colors

- Midnight navy \`#14283a\` — navigation, editorial backgrounds, emphasis.
- Warm ivory \`#f7f5ef\` — app canvas, muted cards, calm contrast.
- Coral \`#c94b33\` — primary actions, active states, selected chips.

White, gray, and border tones are neutrals, not additional brand colors.
Use coral for an **actual** important action rather than every decorative icon.

## Typography

- \`Manrope\` for interface text, navigation and input labels.
- \`DM Serif Display\` for major headings and editorial statements.

Typography and font loading live in \`studio.css\` and \`frontend/index.html\`.

## Interactions

- Buttons have 44+ px tap targets and subdued elevation effects.
- Product cards have lift-on-hover without hiding their purchase action.
- Dropdown menus remain anchored to their triggers with keyboard focus.
- Pages use semantic section labels and responsive containers.
- Smooth animation is disabled by \`prefers-reduced-motion\`.

## Feature safety

The redesign changes **presentational code only**. Existing
catalog/cart/wishlist, API, payment-protection and admin logic are preserved.
Never fake checkout success or show unverified ratings, inventory or discounts.

## Maintenance

Make future visual changes in \`studio.css\`. Reuse existing
\`jn-\` and \`reference-\` classes; when extracting React components,
keep their API behavior and access controls intact.
