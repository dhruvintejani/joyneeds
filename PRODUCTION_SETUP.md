# JoyNeeds production configuration

Use Node 22. Copy `frontend/.env.example` to `frontend/.env` and `backend/.env.example` to `backend/.env` for local development. Never commit the populated files. For Vercel/Render, enter values in the respective environment dashboards. All VITE_ variables are public and embedded at build time; redeploy after changing them.

| Integration | Where to configure | Required values |
|---|---|---|
| Neon PostgreSQL | Render/backend | DATABASE_URL (pooled), DIRECT_URL (direct migrations) |
| Vercel API relay | Vercel | VITE_API_URL=same-origin, BACKEND_ORIGIN=https://your-render-host |
| CORS/admin cookies | Render | NODE_ENV=production, FRONTEND_URL=https://joyneeds.vercel.app (or exact custom origin) |
| Clerk customer auth | Both | VITE_CLERK_PUBLISHABLE_KEY (Vercel), CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY (Render; same instance) |
| Admin login | Render | ADMIN_EMAIL, ADMIN_PASSWORD_HASH (bcrypt), ADMIN_SESSION_TTL_HOURS |
| Cloudinary | Render | CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_FOLDER |
| Paytm | Render | PAYMENT_PROVIDER=PAYTM, PAYTM_ENV=staging, PAYTM_MID, PAYTM_MERCHANT_KEY, PAYTM_WEBSITE_NAME, PAYTM_CALLBACK_URL=https://your-render-host/api/payments/paytm/callback |
| Razorpay (alternative) | Render | PAYMENT_PROVIDER=RAZORPAY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET |
| Checkout | Both | VITE_PAYMENT_PROVIDER matching PAYMENT_PROVIDER; VITE_CHECKOUT_ENABLED and ORDER_CREATION_ENABLED |
| Brevo | Render | BREVO_API_KEY, BREVO_SENDER_EMAIL (verified), BREVO_SENDER_NAME, optional BREVO_REPLY_TO_EMAIL |
| Store business info | Vercel | VITE_SITE_URL, VITE_SUPPORT_EMAIL, VITE_BUSINESS_EMAIL, VITE_SUPPORT_PHONE, VITE_BUSINESS_ADDRESS, VITE_LEGAL_ENTITY_NAME, policy values in frontend example |

Leave both checkout flags false while deploying. Use a **separate staging database and test merchant credentials** to test checkout with both flags true, then disable until live onboarding, policy review and fulfillment checks are complete. Do not run seeds or tests against existing production data. Keep provider credentials available for reconciliation of existing transactions when switching gateways.

## Setup order

1. Install dependencies, create Neon database and configure both URLs locally.
2. Run `npm run db:validate` and `npm run db:migrate:deploy` against the intended database. Run `npm run db:seed` once only when initializing catalog data.
3. Run `npm run typecheck`, `npm run build`, and `npm test` with a separate seeded test database (see GitHub Actions). Never run destructive test fixtures on production.
4. Deploy Render from the tested commit, confirm `/api/health` and `/api/health/ready`.
5. Configure Vercel and redeploy. Verify the relay at `/api/health/ready` and product/category responses.
6. Complete provider dashboard setup: Clerk email/password and Google OAuth domains, Cloudinary account, Brevo verified sender, and selected merchant onboarding/callback or webhook.
7. Test login/signup/logout, account isolation, cart persistence, admin cookie refresh/logout, product/category CRUD, image upload/replace/delete, guest and customer checkout, captured/failed/pending payments, callbacks, inventory, refund handling, transactional email and mobile layout. Verify catalog/policy details before enabling live checkout.

## Known scope limits

Customer administration now lists real synced accounts and their recent orders. Coupons support reusable percentage discounts (no stacking or usage limits), optional expiration, minimum order value and archival. Content management supports editable homepage copy and an optional announcement. Apply the new database migration before deploying this backend. The contact form sends directly to a fixed support inbox when Brevo and CONTACT_RECIPIENT_EMAIL are configured; otherwise it opens an email draft. Paytm refunds are not implemented as a provider API workflow. These require additional application development, not just credentials. Do not label them production-ready until implemented and tested. See DEPLOYMENT.md and AUTH_SETUP.md for provider-specific details.

For direct contact submissions, set CONTACT_RECIPIENT_EMAIL on Render to the approved support inbox and configure Brevo. Test receipt using a real message. The form has bounded input, a fixed server-side recipient, origin checks and rate limiting.

## Shipping and policies

Set SHIPPING_FEE_PAISE on Render to the approved flat fee (0 for free). VITE_SHIPPING_FEE_PAISE on Vercel is an optional cart estimate; checkout reads the actual amount from the API and checks the returned order total before opening payment. Policy copy must be reviewed by the actual merchant before VITE_POLICIES_VERIFIED is set to true. No legal or operational assurances have been invented.
