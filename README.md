# JoyNeeds

JoyNeeds is being migrated from a frontend-only storefront into a production-oriented monorepo in controlled phases.

## Current status

Phase 1 and Phase 2 foundations are implemented on migration branches.

- `frontend/` preserves the existing premium React/Vite storefront and its current local cart, wishlist, checkout preview, SEO, policies and UI.
- `backend/` contains the Express/TypeScript API, Prisma 7, PostgreSQL models, migrations, catalog seeding, and read-only product/category APIs.
- Customer auth, admin auth, order creation, Razorpay, Cloudinary and Brevo are intentionally not implemented yet.

## Monorepo

```text
joyneeds/
  frontend/
  backend/
    prisma/
      migrations/
      schema.prisma
      seed.ts
    src/
  package.json
```

The root uses npm workspaces only; no extra monorepo framework is required.

## Requirements

- Node.js 22 recommended
- npm
- PostgreSQL (the production database will be the existing Neon project)

Prisma 7 is used because it is fully supported on Node 22. The backend uses the PostgreSQL `pg` driver through `@prisma/adapter-pg`.

## Install

```bash
npm install
```

## Environment

Copy the examples instead of committing real `.env` files.

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Phase 2 backend values:

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=<your Neon runtime/pooled PostgreSQL URL>
DIRECT_URL=<your Neon direct PostgreSQL URL>
```

`DIRECT_URL` is recommended for Prisma migrations on Neon. If it is omitted, Prisma CLI falls back to `DATABASE_URL`.

Never commit either database URL.

## Prisma / Neon setup

After setting the URLs in `backend/.env`:

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

To inspect the database:

```bash
npm run db:studio
```

The initial migration creates the relational architecture for users, addresses, categories, products, product images, wishlists, carts, orders, order items, payments and idempotent payment events.

Money is stored as integer paise. Existing numeric frontend product IDs are preserved only as nullable unique `legacyId` migration references; primary database IDs use CUIDs.

The seed is repeatable and migrates the exact existing JoyNeeds catalog source. It does not invent ratings, reviews, discounts or stock quantities. Unknown stock quantities remain `NULL`.

## API

Current public read endpoints:

```text
GET /api/health
GET /api/products
GET /api/products/:slug
GET /api/categories
```

`GET /api/products` supports bounded pagination and optional query parameters:

```text
page
limit
q
category
subcategory
minPricePaise
maxPricePaise
inStock
featured
sort=featured|price-asc|price-desc|newest
```

The API returns integer `pricePaise` / `originalPricePaise` values. The backend database is the future pricing authority; Phase 3 will connect the existing frontend product UX to these APIs.

## Development

Run both apps:

```bash
npm run dev
```

Or separately:

```bash
npm run dev:frontend
npm run dev:backend
```

## Verification

With the database configured and migrated/seeded:

```bash
npm run typecheck
npm test
npm run build
```

GitHub Actions runs PostgreSQL 16 in an isolated CI service, applies the committed migration, seeds all 30 existing products and 6 categories, then runs typecheck, API/frontend tests and builds.

## Deployment direction

- Frontend: Vercel
- Backend: Render
- Database: existing Neon PostgreSQL project
- Customer authentication later: Clerk
- Product images later: Cloudinary
- Payments later: Razorpay
- Transactional email later: Brevo

No secrets belong in the frontend or Git repository.

## Phase boundaries

### Completed in Phase 1

- monorepo conversion
- frontend moved intact to `frontend/`
- Express + TypeScript backend
- security middleware and error handling
- environment validation
- health endpoint
- CI verification

### Implemented in Phase 2

- Prisma 7 + PostgreSQL adapter
- relational schema for the planned commerce system
- versioned initial SQL migration
- exact legacy catalog seed path
- categories/products database access
- product/category REST APIs
- query validation and pagination
- database-backed integration tests

### Next: Phase 3

Replace direct reads from the frontend static catalog with the backend API while preserving the existing premium search, filters, product pages, cart and wishlist UX. Static data should not be removed until API-backed behavior is verified.
