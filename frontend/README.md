# JoyNeeds frontend

React 19, TypeScript, Vite, Tailwind CSS, React Router, Zustand Persist, Formik/Yup, Framer Motion, Lucide and React Helmet Async. No backend, database or payment API is connected.

## Run

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

The build includes strict TypeScript checking. Pages are lazy-loaded. `vercel.json` provides SPA rewrites for direct links and refreshes.

## Current status: prelaunch frontend

- The 30 original product records are retained in `src/data/products.ts`. No replacement products or product photos were invented. Confirm the final catalog, prices, specifications, stock, and any marketing claims before launch.
- The repository did not contain the 30 referenced `/products/*.webp` photos. Supply the exact files under `public/products/` or update their paths. The UI displays an image-unavailable fallback until they are supplied.
- Supplied logo and icon are copied unchanged into `public/brand/`. Keep their aspect ratios and do not recreate the brand.
- `src/config/site.ts` centralizes contact information and policy settings. Email and phone are retained from the original repository; verify they should remain public. Supply the legal business identity, address, shipping coverage/timelines/charges, return window, refund timing and cancellation conditions.
- Policies in `src/data/policies.ts` are visibly provisional, not legal approval. Arrange business/legal review before selling. Official reference: [Department of Consumer Affairs rules](https://consumeraffairs.gov.in/pages/consumer-protection-acts).
- Unverified discounts, ratings and bestseller claims are hidden. Confirm the data before setting `catalogVerified`. New-arrival and gallery/specification fields are optional; do not populate them with invented facts.
- `policiesVerified` does not bypass the missing backend. Checkout only validates fields, does not send or save personal data, and never creates a fake order confirmation. The old order-success route redirects to checkout.
- The contact form opens an email draft and never claims to have sent a message.
- `robots.txt` and page metadata prevent indexing during preparation. Review both before launch. Generate a sitemap from the final verified catalog and domain at that time; no provisional sitemap is published.

## Architecture

- `src/components/common`: shared controls, dialog drawer, search, fallback UI, form fields and metadata.
- `src/components/layout`: header/footer, using the supplied brand.
- `src/pages`: lazy-loaded page components. Existing policy URLs remain supported through redirects.
- `src/store`: resilient browser-only cart, wishlist and recent product IDs. Old saved cart products are reconciled against the current catalog instead of trusting saved prices.
- `src/utils/catalog.ts`: pure search/filter/sort helpers and quantity limits.
- `src/utils/storage.ts`: optional storage with malformed JSON and unavailable-storage handling.
- `src/data/policies.ts` and `src/config/site.ts`: centralized provisional content/settings.

## Future payments

Add a separate backend that calculates prices from authoritative product data, creates gateway orders, verifies payment signatures and webhooks, and stores orders securely. Never add a Razorpay secret to this frontend or a `VITE_` environment variable. Do not treat a redirect or browser state as proof of payment.

## Validation and limitations

`npm test` exercises real source modules for catalog integrity, filtering/sorting, quantity bounds, invalid persisted data, wishlist/recent-state behavior, unavailable storage, and checkout validation.

Browser QA could not run because this environment blocked the browser preview. Responsive CSS covers mobile, tablet, desktop and wide screens, but screenshots, browser interactions, real reload persistence, keyboard/focus behavior, browser compatibility, and Lighthouse/Core Web Vitals remain unverified. Before merging/releasing, test all routes at 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920 px, plus 200% text zoom and reduced motion. Check menu/filter dialogs, search arrows/Enter/Escape, cart/wishlist persistence, invalid URLs, missing photos and form validation. Do not submit this unverified preview as a completed merchant-review site.
