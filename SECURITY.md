# JoyNeeds Security

## Secrets

Never commit or expose these values to the frontend:

- `DATABASE_URL`
- `DIRECT_URL`
- `CLERK_SECRET_KEY`
- `ADMIN_PASSWORD_HASH`
- `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `BREVO_API_KEY`

Only explicitly public browser configuration such as `VITE_CLERK_PUBLISHABLE_KEY` may be placed in the frontend environment.

If a secret is ever committed, pasted into a public issue/log, or exposed to the browser, rotate it at the provider. Removing it from the latest Git commit is not enough.

## Authentication boundaries

### Customer auth

Clerk is optional and customer-only. Backend authorization uses the verified Clerk identity from the request, never a user ID supplied by the browser.

### Admin auth

Admin authentication is separate from Clerk. The backend compares a bcrypt hash and creates a random opaque session token. Only the token hash is persisted; the browser receives the session in an HttpOnly cookie.

Admin write requests require both a valid admin session and the configured frontend origin.

## Payments

- Order totals come from PostgreSQL catalog/order records.
- The browser cannot choose the charge amount.
- Razorpay Checkout success is not sufficient proof of payment.
- The backend verifies HMAC signatures and confirms provider payment status/amount/currency.
- Razorpay webhooks are verified against the raw body.
- Provider event IDs are persisted for duplicate handling.
- Paid/refunded terminal states are protected from older webhook events.
- Admin users cannot manually force a pending order into a paid state.
- Refunds are created through Razorpay and reconciled back into local payment/order state.

Keep `ORDER_CREATION_ENABLED=false` until a test-mode end-to-end payment flow has been completed after deployment.

## Inventory

Pending orders do not reserve or decrement stock. Known inventory is committed only when payment confirmation drives the order to confirmed state. Unknown stock remains `NULL` and is not fabricated.

## Product images

Cloudinary image writes are admin-only. Uploads are bounded by file count and size, allowed image types are restricted, and file signatures are checked in addition to MIME metadata.

Cloudinary credentials stay on the backend.

## Transactional email

Brevo sends use backend-only credentials and persisted dedupe state. Email failure is non-transactional with respect to payments/orders: an email provider outage must not roll back a successful commerce transaction.

## HTTP/API controls

The backend currently includes:

- Helmet security headers
- exact-origin CORS
- global and route-specific rate limiting
- bounded JSON/urlencoded bodies
- bounded raw Razorpay webhook body
- bounded multipart image uploads
- Zod request validation
- safe 400 handling for malformed JSON
- safe 413 handling for oversized request bodies
- safe generic 500 responses without stack traces
- liveness and database-readiness endpoints
- graceful shutdown with Prisma disconnect

The Vercel frontend configuration adds baseline browser headers and immutable caching for hashed assets.

## Database and migrations

- Use Neon pooled connection for runtime where appropriate.
- Use the direct connection for Prisma migrations.
- Do not run the catalog seed automatically on every production deploy.
- Apply migrations before starting code that depends on them.
- Treat database rollback separately from application rollback.

## Dependency policy

A root `package-lock.json` is not currently committed, so CI uses `npm install` and then runs:

```bash
npm run audit:prod
```

High-severity production dependency findings fail verification. If a real root lockfile is generated and committed later, switch CI, Render and Vercel to `npm ci` in the same change. Do not use `npm audit fix --force` blindly; review breaking dependency updates before applying them.

## Production checklist

Before enabling real orders:

- [ ] GitHub Actions is green on the exact commit being deployed
- [ ] production dependency audit is green
- [ ] Neon migrations are applied
- [ ] Render `/api/health/ready` returns 200
- [ ] `FRONTEND_URL` exactly matches the deployed frontend origin
- [ ] admin uses a strong unique password and only its bcrypt hash is configured
- [ ] Clerk production configuration is correct if customer auth is enabled
- [ ] Cloudinary upload/replace/delete works from admin
- [ ] Razorpay webhook signature verification works in test mode
- [ ] successful/failed/cancelled payment flows have been tested
- [ ] partial/full refund flows have been tested
- [ ] Brevo sender is verified and transactional emails have been tested
- [ ] `ORDER_CREATION_ENABLED` remains false until all checks above pass
- [ ] customer-facing business, shipping, refund and policy information has been reviewed for accuracy
- [ ] final product data/images have replaced any placeholder catalog content that should not go live
