# JoyNeeds

JoyNeeds is being migrated from a frontend-only storefront into a production-oriented full-stack e-commerce monorepo. The premium frontend is preserved and backend capabilities are being added progressively in reviewable phases.

## Current phase

Phase 1 establishes the monorepo and backend foundation only. It does **not** add a database, authentication, payments, Cloudinary, Brevo, or live order creation yet.

## Repository structure

```text
joyneeds/
├─ frontend/        React + TypeScript + Vite storefront
├─ backend/         Express + TypeScript REST API
├─ package.json     npm workspaces and root commands
├─ .gitignore
├─ vercel.json      current monorepo-aware frontend deployment config
└─ README.md
```

The existing frontend implementation, public routes, product catalog, cart, wishlist, checkout preview, policies, SEO and premium styling are retained under `frontend/`.

## Requirements

- Node.js 20+
- npm

## Install

From the repository root:

```bash
npm install
```

The root package uses npm workspaces for `frontend` and `backend`.

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

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Health API: `http://localhost:4000/api/health`

## Checks

```bash
npm run typecheck
npm run test
npm run build
```

These commands run the relevant checks for both workspaces.

## Environment variables

Copy the example file before starting the backend locally:

```bash
cp backend/.env.example backend/.env
```

Phase 1 requires only:

```text
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173
```

Do not commit real `.env` files. Future service credentials will be introduced only in the phase that actually uses them.

## Backend foundation

Phase 1 includes:

- Express + strict TypeScript
- Zod environment validation
- Helmet security headers
- explicit CORS origin configuration
- request size limits
- rate limiting
- centralized safe error responses
- structured server logging
- `GET /api/health`
- a health endpoint test

The backend intentionally has no database or commerce business logic yet.

## Frontend safety

The frontend remains the same prelaunch storefront after moving to `frontend/`. Product data is still static in this phase and guest cart/wishlist data remains browser-local. Checkout still validates fields only and does not create orders or accept payments.

## Planned phases

1. Monorepo + backend foundation — current
2. Prisma + existing Neon PostgreSQL + product/category schema and seed
3. Frontend product API integration
4. Optional Clerk customer authentication while preserving guest checkout
5. Separate admin authentication and admin dashboard
6. Orders, inventory validation and customer/guest order architecture
7. Cloudinary product image management
8. Razorpay order/payment verification and webhooks
9. Brevo transactional emails
10. Security hardening, testing, performance and deployment documentation

Each phase should pass relevant checks before the next phase begins.

## Deployment direction

- Frontend: Vercel
- Backend: Render
- Database: existing Neon PostgreSQL project
- Product images: Cloudinary
- Customer authentication: Clerk
- Payments: Razorpay
- Transactional email: Brevo

No credentials for those future services are stored in this repository.
