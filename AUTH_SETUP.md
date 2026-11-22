# JoyNeeds authentication setup (Clerk + Google OAuth + secured admin)

This repository already implements account sign-in, registration, session handling,
a customer record in Neon and a separate protected administrator.

**There is no self-service administrator registration.** Only an administrator
with a matching server-side email + bcrypt hash can sign in at /admin.

## Why Clerk rather than writing custom OAuth

OAuth 2.0 is a standard, not an authentication company or an account database.
JoyNeeds uses Clerk to manage email/password or passkey sign-in and the Google
social login flow, rather than handling passwords or OAuth refresh tokens itself.
Auth0 is another product, but it is NOT the backend currently integrated in this
repository. Switching to Auth0 would require code changes and retesting.

Free-tier allowances and billing can change; check provider pricing before launch.

## 1. Create the Clerk project and Google OAuth connection

1. Create a **JoyNeeds** application in the Clerk dashboard.
2. Enable email/password or the desired passwordless method for customers.
3. Under **User & Authentication → Social Connections**, enable **Google**.
4. Configure Google's consent screen and the production OAuth credentials
   requested by Clerk. Register the actual callback URLs supplied by Clerk,
   **not guessed** localhost or Vercel URLs.
5. Add and verify the exact production domain where you will host JoyNeeds.
6. When using a Clerk production instance, ensure the Google OAuth application
   has been published for production; development-only testing settings will not
   admit arbitrary customers.
7. Copy the Clerk **publishable** and **secret** keys from the **same** Clerk
   application to their respective hosting environments.

Google OAuth settings, consent publishing and registered redirect URIs are
managed in the provider consoles. These are not simply environment variables.

## 2. Set frontend variables in Vercel

Settings → Environment Variables → Production:

\`\`\`env
VITE_CLERK_PUBLISHABLE_KEY=
VITE_API_URL=
VITE_CHECKOUT_ENABLED=false
\`\`\`

- \`VITE_CLERK_PUBLISHABLE_KEY\`: publishable key from Clerk; safe for the browser.
- \`VITE_API_URL\`: deployed backend origin, e.g. the HTTPS Render web service.
  Do **not** append \`/api\`. Storefront API helpers append it.
- Checkout remains disabled until merchant onboarding and payment verification.

Vercel environment variables are embedded at build time. **Redeploy after
changing them.**

**Never** add \`CLERK_SECRET_KEY\`, \`DATABASE_URL\`,
\`ADMIN_PASSWORD_HASH\`, or payment secrets to \`VITE_*\` variables.

## 3. Set backend variables in Render

Render service → Environment. Use the same Clerk instance as the frontend.

\`\`\`env
NODE_ENV=production
FRONTEND_URL=https://joyneeds.vercel.app
DATABASE_URL=
DIRECT_URL=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_TTL_HOURS=12
ORDER_CREATION_ENABLED=false
\`\`\`

- \`DATABASE_URL\`: Neon pooled runtime connection.
- \`DIRECT_URL\`: Neon direct URL for migrations if used by the migration config.
- \`FRONTEND_URL\`: exact **origin** (scheme/host, no trailing slash) of the browser
  storefront. It is used for CORS and origin verification for admin writes.
- \`ADMIN_EMAIL\`: the single authorized administrator's email address.
- \`ADMIN_PASSWORD_HASH\`: an ordinary **bcrypt hash**, never a plaintext password.
  Generate locally or with a trusted password-manager/script:
  \`node -e "const b=require('bcryptjs');b.hash(process.argv[1],12).then(console.log)"\`
  and supply the password as an argument in a private terminal session
  (avoid recording the password in shell history).
  Better: use a local interactive Node prompt or password manager.

The backend also needs migration and seed setup before it can persist records:

\`\`\`bash
npm run db:migrate:deploy
npm run db:seed
\`\`\`

Only seed a new/empty production catalog intentionally. Do not run the seed
against a catalog edited by administrators.

## 4. Browser and domain setup for admin login

Admin uses a secure HttpOnly cookie with CSRF Origin checks. A Vercel origin
and a completely separate Render origin can be treated as **cross-site** by
browsers, which may block cookie-based admin login.

Use a same-site custom domain or a tested **same-origin API reverse proxy**
before treating admin authentication as production-ready for all browsers.
Merely setting cross-origin URLs does not guarantee cookie persistence.
Do not disable HttpOnly/Secure cookies or Origin validation to bypass this.

## 5. Test sign-in and admin access after connecting

- Visit \`/sign-in\` and sign in via email.
- Visit \`/sign-up\` and create a new account with Google OAuth.
- Verify redirect to \`/account\`, customer identity and backend user sync.
- Verify \`/api/account\` rejects missing or invalid bearer tokens.
- Open \`/admin\`: an unauthorized customer must **not** be able to access it.
- Log in using the configured admin email/password; refresh the page and confirm
  the session persists without exposing the token in JavaScript.
- Sign out and verify the session is revoked and protected admin requests fail.
- Verify a logged-in customer sees only their own orders and cart.
- Keep live checkout disabled until merchant payment and fraud tests pass.

## Remaining external actions

You must create the actual Clerk and Google provider applications, enter
environment values, deploy the backend, run migrations, and verify domain
and session behavior. Code in this repo cannot create merchant or OAuth
credentials on your behalf.
