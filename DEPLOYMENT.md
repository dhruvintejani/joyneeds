# JoyNeeds Deployment

This guide assumes the intended production layout:

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL
- Customer auth: Clerk (optional)
- Images: Cloudinary
- Payments: Razorpay
- Transactional email: Brevo

Do not enable live order creation until the backend, database, Razorpay webhook and frontend have all been verified together.

## 1. Prepare Neon

Use the existing Neon project and keep two connection strings:

```env
DATABASE_URL=<pooled/runtime connection>
DIRECT_URL=<direct connection for Prisma migrations>
```

Do not commit either URL.

Before the first production backend deploy, apply the committed migrations against Neon:

```bash
npm ci
npm run db:validate
npm run db:migrate:deploy
```

Run the catalog seed only when intentionally initializing the production catalog:

```bash
npm run db:seed
```

Do **not** make `db:seed` part of every production deployment. After products are edited through the admin panel, an automatic seed can overwrite intentional catalog changes.

## 2. Configure admin credentials

Set a dedicated admin email and a bcrypt password hash:

```env
ADMIN_EMAIL=<admin email>
ADMIN_PASSWORD_HASH=<bcrypt hash>
ADMIN_SESSION_TTL_HOURS=12
```

Never put the plaintext admin password in `.env`, GitHub, Vercel or frontend code.

## 3. Deploy the backend on Render

The root `render.yaml` defines the `joyneeds-api` web service.

Important defaults:

- Build: `npm ci && npm run build:backend`
- Start: `npm run start --workspace backend`
- Health check: `/api/health/ready`
- Automatic deploys: **off**

Automatic deploys are intentionally disabled because production Prisma migrations must be applied before a new backend version is started.

Set these Render environment values as needed:

```env
NODE_ENV=production
FRONTEND_URL=https://<your-vercel-or-custom-frontend-origin>
DATABASE_URL=
DIRECT_URL=

CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_TTL_HOURS=12

ORDER_CREATION_ENABLED=false

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=joyneeds/products

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=JoyNeeds
BREVO_REPLY_TO_EMAIL=
```

`FRONTEND_URL` must be the exact browser origin, for example:

```text
https://joyneeds.com
```

Do not add a trailing slash. The backend CORS policy intentionally accepts only that configured browser origin.

After deployment, confirm:

```text
GET https://<render-service>/api/health
GET https://<render-service>/api/health/ready
```

Both should return HTTP 200. The readiness endpoint also checks PostgreSQL connectivity.

## 4. Deploy the frontend on Vercel

The root `vercel.json` installs from the lockfile and builds only the frontend workspace.

Set:

```env
VITE_API_URL=https://<render-service>
VITE_CLERK_PUBLISHABLE_KEY=<optional Clerk browser key>
```

Do not add backend secrets to Vercel frontend environment variables.

After deploy, verify:

- `/` storefront loads
- `/shop` loads products from the backend
- `/product/<slug>` loads
- `/cart` and `/checkout` render
- `/admin` shows the separate admin login, not the storefront shell

## 5. Configure Clerk (optional customer accounts)

If customer sign-in is wanted, configure the same Clerk application across frontend/backend:

Backend:

```env
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Frontend:

```env
VITE_CLERK_PUBLISHABLE_KEY=
```

Enable the desired email/password and Google sign-in methods in Clerk. Guest storefront and checkout remain supported.

## 6. Configure Cloudinary

Set the backend-only Cloudinary values and verify an admin can:

1. upload a product image
2. replace it
3. delete it
4. see the storefront refresh to the stored secure image URL

Do not enable arbitrary frontend upload credentials.

## 7. Configure Razorpay in test mode first

Keep:

```env
ORDER_CREATION_ENABLED=false
```

while configuring Razorpay.

Set backend test credentials:

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Configure the Razorpay webhook URL:

```text
https://<render-service>/api/payments/razorpay/webhook
```

The application verifies the webhook against the exact raw request body. Do not place another JSON-transforming proxy in front of this endpoint unless it preserves the body bytes.

Test at minimum:

- successful captured payment
- cancelled checkout window
- failed payment
- duplicate webhook delivery
- admin partial refund
- admin full refund
- full refund before shipping restores known committed inventory

Only after the end-to-end test passes should you set:

```env
ORDER_CREATION_ENABLED=true
```

Then repeat the flow with the intended Razorpay environment before accepting real customer orders.

## 8. Configure Brevo

Set a verified Brevo sender:

```env
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=JoyNeeds
BREVO_REPLY_TO_EMAIL=
```

Verify confirmation/status messages arrive as expected. Email failures do not roll back successful payments/orders, so inspect backend logs and the `email_deliveries` records if delivery fails.

## 9. Safe deployment sequence for later releases

For every release containing a Prisma migration:

1. keep Render auto-deploy disabled
2. run `npm ci`
3. run `npm run audit:prod`
4. run `npm run db:validate`
5. run `npm run db:migrate:deploy` against production Neon
6. confirm the migration succeeds
7. manually deploy the same tested commit on Render
8. confirm `/api/health/ready` is HTTP 200
9. deploy/confirm Vercel frontend if frontend changed
10. perform a smoke test before changing payment flags

On a paid Render plan, a `preDeployCommand` can be used for migrations instead of the manual migration step. Keep the migration step separate from the normal build command.

## 10. Rollback note

Application code can be rolled back, but database migrations are forward changes. Do not assume rolling back a Render commit automatically rolls back Neon schema changes. Prefer backward-compatible migrations and take a Neon restore point/branch before risky schema changes.
