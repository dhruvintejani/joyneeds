# JoyNeeds

JoyNeeds is a production-oriented e-commerce monorepo with a React storefront, a separate admin experience, and a Node/Express/PostgreSQL backend.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind, React Router, Zustand, Formik/Yup
- Backend: Node.js, Express, TypeScript, Zod
- Database: PostgreSQL with Prisma 7 and `@prisma/adapter-pg`
- Production database target: Neon
- Optional customer auth: Clerk
- Admin auth: separate email/password + PostgreSQL-backed opaque HttpOnly sessions
- Product images: Cloudinary
- Payments: Razorpay
- Transactional email: Brevo
- Frontend deployment target: Vercel
- Backend deployment target: Render

The customer storefront and admin UI share the same frontend project but use separate route trees. `/admin/*` never renders the storefront shell.

## Repository layout

```text
joyneeds/
  frontend/
  backend/
    prisma/
      migrations/
      schema.prisma
      seed.ts
    src/
    test/
  .github/workflows/verify.yml
  render.yaml
  vercel.json
  package.json
```

## Important safety rules

- Money is stored as integer paise.
- Product prices and order totals are calculated by the backend, not trusted from the browser.
- Razorpay payment success is verified server-side before an order is treated as paid.
- Razorpay webhooks use the exact raw request body and persisted event IDs for duplicate handling.
- Admin authentication is separate from Clerk.
- Provider secrets belong only in backend environment variables.
- Guest checkout remains supported when customer login is not used.
- Unknown inventory stays unknown; the application does not invent stock quantities.
- The repository contains no real API keys, passwords or production database credentials.

## Requirements

- Node.js 22 recommended
- npm
- PostgreSQL/Neon connection

## Install

```bash
npm install
```

A root `package-lock.json` is not currently committed, so CI and deployment use `npm install` and then run a production dependency audit. If a lockfile is added later, switch CI/deployment to `npm ci` in the same change.

## Environment

Create local env files from the examples:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Minimum backend development values:

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=<Neon pooled/runtime PostgreSQL URL>
DIRECT_URL=<Neon direct PostgreSQL URL>
```

`DATABASE_URL` is used by the running API. `DIRECT_URL` is used by Prisma CLI/migrations when present.

Optional integrations are documented in `backend/.env.example`. Do not paste secrets into source files or commit `.env` files.

Frontend production requires:

```env
VITE_API_URL=https://<your-render-backend>
VITE_CLERK_PUBLISHABLE_KEY=<optional Clerk public key>
```

The Razorpay public checkout key is returned by the backend for a prepared payment; no Razorpay secret belongs in the frontend env.

## Database setup

After configuring `backend/.env`:

```bash
npm run db:generate
npm run db:validate
npm run db:migrate:deploy
npm run db:seed
```

For local schema development only:

```bash
npm run db:migrate:dev
```

Prisma Studio:

```bash
npm run db:studio
```

The committed seed is repeatable and currently migrates the existing 30-product / 6-category JoyNeeds catalog source. It does not create fake customers, orders, payments, reviews or analytics.

## Development

Run frontend and backend together:

```bash
npm run dev
```

Or separately:

```bash
npm run dev:frontend
npm run dev:backend
```

Local URLs:

```text
Storefront: http://localhost:5173/
Admin:      http://localhost:5173/admin
API:        http://localhost:4000
Health:     http://localhost:4000/api/health
Readiness:  http://localhost:4000/api/health/ready
```

The storefront catalog is API-backed. If the backend/database is not running and seeded, product data will not load.

## Authentication

### Customers

Clerk is optional. Configure both backend Clerk variables plus the frontend publishable key to enable customer sign-in. Without Clerk configuration, JoyNeeds continues in guest mode.

### Admin

Admin auth is intentionally separate from Clerk.

```env
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_TTL_HOURS=12
```

`ADMIN_PASSWORD_HASH` must be a bcrypt hash, not a plaintext password. Admin sessions use random opaque tokens; only their hashes are persisted in PostgreSQL and the browser receives an HttpOnly cookie.

## Catalog and images

Public catalog APIs read from PostgreSQL. Admin product/category writes require a valid admin session.

Cloudinary image writes require:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=joyneeds/products
```

Image uploads are admin-only, size/count bounded and content-signature checked. Existing seeded/local image URLs remain readable until products are replaced with Cloudinary-managed images.

## Orders and Razorpay

Live order creation is fail-closed by default:

```env
ORDER_CREATION_ENABLED=false
```

Razorpay requires all three backend values:

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Webhook endpoint:

```text
POST /api/payments/razorpay/webhook
```

Keep `ORDER_CREATION_ENABLED=false` until test-mode checkout and the public webhook endpoint have been verified. Only then enable it in the deployment environment.

Pending orders do not consume stock. Known inventory is committed after captured payment verification. Full refunds restore committed known inventory only when the order has not shipped.

## Brevo transactional email

Configure a verified Brevo sender:

```env
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=JoyNeeds
BREVO_REPLY_TO_EMAIL=
```

Transactional email delivery is persisted with dedupe state. Email failures are recorded/logged separately and cannot roll back a successful order or payment transaction.

## Verification

Run the complete local verification sequence with a configured database:

```bash
npm run audit:prod
npm run db:validate
npm run db:migrate:deploy
npm run db:seed
npm run typecheck
npm test
npm run build
```

GitHub Actions runs PostgreSQL 16, installs dependencies, audits production dependencies for high-severity findings, applies all migrations, seeds the catalog, runs TypeScript/tests and builds both workspaces.

## Deployment

Deployment details and the safe migration order are in [`DEPLOYMENT.md`](./DEPLOYMENT.md).

- `vercel.json` builds only the frontend and adds baseline security/cache headers.
- `render.yaml` defines the backend service and uses `/api/health/ready` for health checks.
- Render auto-deploy is intentionally disabled in the Blueprint so production database migrations can be applied before each manual deployment.

## Security

See [`SECURITY.md`](./SECURITY.md) for the production checklist and secret-handling rules.

Before enabling live payments, verify every business/policy value shown to customers and replace the current seed catalog with final product data where required.
