import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'vite';

// Vite transforms the actual TypeScript source; no duplicate test implementation.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { products: seedProducts, categories: seedCategories } = await server.ssrLoadModule('/src/data/products.ts');
  const { selectProducts, matchesSearch, maxQuantity, discount } = await server.ssrLoadModule('/src/utils/catalog.ts');
  const { restoreCart, reconcileCart, useCartStore } = await server.ssrLoadModule('/src/store/cartStore.ts');
  const { useDiscoveryStore } = await server.ssrLoadModule('/src/store/discoveryStore.ts');
  const { checkoutSchema } = await server.ssrLoadModule('/src/pages/Checkout.tsx');
  const { safeStorage } = await server.ssrLoadModule('/src/utils/storage.ts');
  const { validatePreview, passwordCriteria, emptyFields } = await server.ssrLoadModule('/src/auth/authPreviewValidation.ts');

  assert.equal(seedProducts.length, 30, 'Preserve the exact 30-product database seed source');
  assert.equal(new Set(seedProducts.map(p => p.id)).size, seedProducts.length);
  assert.equal(new Set(seedProducts.map(p => p.slug)).size, seedProducts.length);

  const runtimeProducts = seedProducts.map((product) => ({
    ...product,
    id: `db-${product.id}`,
    legacyId: product.id,
    categorySlug: product.category.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    images: product.images?.length ? product.images : [product.image],
    stockQuantity: product.stockQuantity ?? null,
  }));

  for (const product of runtimeProducts) {
    assert.ok(seedCategories.includes(product.category));
    assert.ok(Number.isFinite(product.price) && product.price >= 0);
  }
  assert.ok(matchesSearch(runtimeProducts[0], 'VEGETABLE kitchen'));
  assert.equal(selectProducts(runtimeProducts, new URLSearchParams('q=no-such-product-xyz')).length, 0);
  assert.equal(selectProducts(runtimeProducts, new URLSearchParams('min=garbage&max=NaN')).length, runtimeProducts.length);
  assert.equal(selectProducts(runtimeProducts, new URLSearchParams('min=500&max=100')).length, 0);
  const ascending = selectProducts(runtimeProducts, new URLSearchParams('sort=price-asc'));
  assert.ok(ascending.every((product,index) => !index || ascending[index-1].price <= product.price));
  assert.ok(selectProducts(runtimeProducts, new URLSearchParams(), seedCategories[0]).every(product => product.category === seedCategories[0]));
  assert.equal(discount(runtimeProducts[0]), 0, 'Do not expose unverified discounts');
  assert.equal(maxQuantity({...runtimeProducts[0], stockStatus:'out_of_stock'}), 0);

  assert.deepEqual(restoreCart(null), []);
  assert.deepEqual(restoreCart([null, {}, {product:{id:1},quantity:'99'}, {product:{id:1},quantity:NaN}]), []);
  const restored = restoreCart([{product:{...seedProducts[0],price:1},quantity:1000}]);
  const reconciled = reconcileCart(restored, runtimeProducts);
  assert.equal(reconciled[0].product.price, runtimeProducts[0].price, 'API catalog values replace stale persisted prices');
  assert.equal(reconciled[0].quantity, 99);

  useCartStore.getState().clearCart();
  assert.equal(useCartStore.getState().addToCart(runtimeProducts[0],2), true);
  assert.equal(useCartStore.getState().getCartCount(),2);
  assert.equal(useCartStore.getState().getCartTotal(),runtimeProducts[0].price*2);
  assert.equal(useCartStore.getState().addToCart(runtimeProducts[0],100),false);
  useCartStore.getState().setQuantity(runtimeProducts[0].id,-2);
  assert.equal(useCartStore.getState().getItemQuantity(runtimeProducts[0].id),2);
  useCartStore.getState().setQuantity(runtimeProducts[0].id,99);
  useCartStore.getState().increaseQuantity(runtimeProducts[0].id);
  assert.equal(useCartStore.getState().getItemQuantity(runtimeProducts[0].id),99);
  useCartStore.getState().removeFromCart(runtimeProducts[0].id);
  assert.equal(useCartStore.getState().getCartCount(),0);

  useDiscoveryStore.setState({ wishlist: [1], recent: [2, 1] });
  useDiscoveryStore.getState().reconcileCatalog(runtimeProducts);
  assert.deepEqual(useDiscoveryStore.getState().wishlist,[runtimeProducts[0].id]);
  assert.deepEqual(useDiscoveryStore.getState().recent,[runtimeProducts[1].id,runtimeProducts[0].id]);
  useDiscoveryStore.getState().toggleWishlist(runtimeProducts[0].id);
  assert.deepEqual(useDiscoveryStore.getState().wishlist,[]);
  for (let index=0; index<12; index++) useDiscoveryStore.getState().view(runtimeProducts[index].id);
  useDiscoveryStore.getState().view(runtimeProducts[11].id);
  assert.equal(useDiscoveryStore.getState().recent.length,8);
  assert.equal(new Set(useDiscoveryStore.getState().recent).size,8);
  assert.equal(useDiscoveryStore.getState().recent[0],runtimeProducts[11].id);
  assert.equal(safeStorage.getItem('unavailable-storage'),null);
  assert.doesNotThrow(() => safeStorage.setItem('x','{}'));

  assert.equal(await checkoutSchema.isValid({}),false);
  assert.equal(await checkoutSchema.isValid({fullName:'Test Shopper',email:'test@example.com',phone:'9000000000',address:'Test address for validation',city:'Test City',state:'Gujarat',pin:'380001'}),true);
  assert.equal(await checkoutSchema.isValid({fullName:'  ',email:'wrong',phone:'123',address:'short',city:'',state:'',pin:'000000'}),false);
  // Preview form validation must not imply that an account was created.
  assert.deepEqual(validatePreview(emptyFields, 'sign-in'), {
    email: 'Email address is required.',
    password: 'Password is required.',
  });
  const validSignup = {
    fullName: 'Sample Customer',
    email: 'shopper@example.com',
    password: 'StrongPass123!',
    confirmPassword: 'StrongPass123!',
    accepted: true,
  };
  assert.deepEqual(validatePreview(validSignup, 'sign-up'), {});
  assert.deepEqual(validatePreview({ ...validSignup, email: 'not-an-email' }, 'sign-up').email, 'Enter a valid email address.');
  assert.ok(validatePreview({ ...validSignup, password: 'abc123' }, 'sign-up').password);
  assert.ok(validatePreview({ ...validSignup, confirmPassword: 'Different123!' }, 'sign-up').confirmPassword);
  assert.ok(validatePreview({ ...validSignup, accepted: false }, 'sign-up').accepted);
  assert.ok(validatePreview({ ...validSignup, fullName: ' ' }, 'sign-up').fullName);
  assert.deepEqual(Object.values(passwordCriteria('StrongPass123!')).every(Boolean), true);
  assert.deepEqual(Object.values(passwordCriteria('password')).every(Boolean), false);
  assert.deepEqual(validatePreview({ ...validSignup, email: 'buyer@example.com', accepted: false }, 'sign-in'), {});
  console.log('PASS: preview login and signup field validation, terms, password strength and matching.');

  // Navigation route smoke checks: prevent accidental removal of customer,
  // policy, error or secured-admin screens during future redesigns.
  const appRoutes = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const adminRoutes = readFileSync(new URL('../src/admin/AdminPhase5Router.tsx', import.meta.url), 'utf8');
  const authPage = readFileSync(new URL('../src/pages/AuthPage.tsx', import.meta.url), 'utf8');
  const notFound = readFileSync(new URL('../src/pages/NotFound.tsx', import.meta.url), 'utf8');
  const style = readFileSync(new URL('../src/studio.css', import.meta.url), 'utf8');
  for (const path of [
    '/', '/shop', '/search', '/category/:category', '/product/:slug',
    '/cart', '/wishlist', '/checkout', '/payment-status', '/account',
    '/sign-in/*', '/sign-up/*', '/about', '/contact', '/faq', '/404',
    '/admin/*',
  ]) {
    assert.ok(appRoutes.includes('path="' + path + '"'), 'Missing storefront or protected route: ' + path);
  }
  for (const path of [
    'products', 'products/new', 'products/:productId/edit', 'orders', 'orders/:orderId', 'payments', 'categories', 'customers', 'customers/:customerId', 'analytics', 'coupons',
    'content', 'settings', 'help',
  ]) {
    assert.ok(adminRoutes.includes('path="' + path + '"'), 'Missing admin workspace: ' + path);
  }
  assert.ok(appRoutes.includes('path="/admin/*" element={<AdminAuthGate><AdminRouter /></AdminAuthGate>}'), 'Every nested admin workspace must be protected by the shared authentication gate.');
  assert.ok(adminRoutes.includes('<Route element={<AdminLayout />}>'), 'All admin workspaces must share responsive navigation.');
  const confirmDialog = readFileSync(new URL('../src/components/common/ConfirmDialog.tsx', import.meta.url), 'utf8');
  assert.ok(appRoutes.includes('<ConfirmProvider>') && confirmDialog.includes('.showModal()') && confirmDialog.includes('onCancel='), 'Confirmation modal must be mounted globally and support keyboard cancellation.');
  for (const file of ['admin/AdminPhase5Router.tsx','admin/AdminOrderWorkspace.tsx','admin/AdminProductEditorWorkspace.tsx','pages/Cart.tsx','pages/Wishlist.tsx']) {
    const source = readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');
    assert.ok(source.includes('useConfirm') && !source.includes('window.confirm('), 'Missing shared confirmation in ' + file);
  }
  const home = readFileSync(new URL('../src/pages/Home.tsx', import.meta.url), 'utf8');
  assert.ok(home.includes('className="jn-category-photo"') && style.includes('--jn-category-photo'), 'Category cards must have an independent photo layer.');
  assert.match(style, /\.jn-category-tile:hover \.jn-category-photo[^{}]*\{transform:scale\(1\.16\)/);
  assert.match(style, /\.jn-category-tile:focus-visible \.jn-category-photo/);
  assert.match(appRoutes, /<Route path="\*" element={<NotFound \/>} \/>/);
  assert.match(adminRoutes, /<Route path="\*" element={<AdminNotFound \/>} \/>/);
  assert.ok(authPage.includes('SignIn') && authPage.includes('SignUp'));
  assert.ok(authPage.includes('auth.enabled'), 'Disabled identity provider must have a safe fallback');
  assert.ok(notFound.includes('jn-404-hero'), 'Missing designed 404 presentation');
  assert.ok(style.includes('--jn-font-ui') && style.includes('--jn-font-display'));
  assert.ok(style.includes('--jn-accent:#c94b33') && style.includes('--jn-cream:#f7f5ef'), 'The three-color design system must remain consistent.');
  const provider = readFileSync(new URL('../src/auth/CustomerAuthProvider.tsx', import.meta.url), 'utf8');
  const authPageSetup = readFileSync(new URL('../src/pages/AuthPage.tsx', import.meta.url), 'utf8');
  const api = readFileSync(new URL('../src/api/catalog.ts', import.meta.url), 'utf8');
  const proxy = readFileSync(new URL('../../api/proxy.ts', import.meta.url), 'utf8');
  const vercel = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));
  assert.ok(provider.includes('signInFallbackRedirectUrl="/account"') && provider.includes('signUpFallbackRedirectUrl="/account"'));
  assert.ok(authPageSetup.includes('fallbackRedirectUrl="/account"'), 'Auth pages need account redirects');
  assert.ok(api.includes('configuredApiUrl === "same-origin"'), 'Missing first-party API option');
  assert.ok(proxy.includes('BACKEND_ORIGIN') && proxy.includes('namespaces') && proxy.includes('set-cookie'), 'Missing secure API relay protections');
  assert.ok(vercel.rewrites.some((entry) => entry.source === '/api/:path*'), 'Missing API relay rewrite');
  const contactPage = readFileSync(new URL('../src/pages/Contact.tsx', import.meta.url), 'utf8');
  const referenceUi = readFileSync(new URL('../src/components/common/ReferenceUI.tsx', import.meta.url), 'utf8');
  const alignment = style;
  const mainEntry = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
  assert.ok(!mainEntry.includes('import "./luxe.css"') && !mainEntry.includes('import "./signature.css"'), 'Conflicting legacy themes should not be imported.');
  assert.ok(authPage.includes('className="jn-auth-inline-note"') && authPage.includes('Account access is managed by our secure authentication provider when enabled.'), 'Authentication security note must render as natural inline prose.');
  assert.ok(authPage.includes('<ShieldCheck className="jn-auth-inline-icon" size={16} aria-hidden="true" />'), 'Security shield should be inline and decorative.');
  assert.match(alignment, /\.jn-auth-inline-note\s*\{[\s\S]*?display:block!important/);
  assert.match(alignment, /\.jn-auth-inline-note \.jn-auth-inline-icon\s*\{[\s\S]*?display:inline-block!important/);
  assert.ok(contactPage.includes('className="jn-icon-row"'), 'Contact checklist rows need consistent alignment.');
  assert.ok(referenceUi.includes('className="reference-link jn-icon-link"'), 'Shared link arrow alignment regressed.');
  assert.ok(mainEntry.includes('import "./studio.css"'), 'Unified design stylesheet is missing.');
  assert.ok(authPage.includes('className="jn-auth-mode-nav"'), 'Sign-in and signup must expose direct route navigation.');
  assert.ok(authPage.includes('aria-current={creating ? undefined : "page"}'), 'Auth navigation must identify the active route.');
  assert.ok(authPage.includes('<AuthPreviewForm key={mode} mode={mode} />'), 'Unconfigured auth must render complete interactive forms.');
  const previewForm = readFileSync(new URL('../src/auth/AuthPreviewForm.tsx', import.meta.url), 'utf8');
  assert.ok(previewForm.includes('aria-invalid={invalid(') && previewForm.includes('noValidate'), 'Preview fields must validate accessibly.');
  assert.ok(previewForm.includes('type="checkbox"') && previewForm.includes('autocomplete') === false, 'Signup must require terms and use real input elements.');
  const header = readFileSync(new URL('../src/components/layout/Header.tsx', import.meta.url), 'utf8');
  assert.ok(header.includes('className="jn-header-signup" to="/sign-up"'), 'Signup must be visible from the site header.');
  assert.ok(header.includes('to={auth.isSignedIn ? "/account" : "/sign-in"}'), 'Account icon should navigate to sign-in when signed out.');
  assert.ok(!style.includes('.jn-auth-surface > .jn-auth-footnote'), 'Detached grid-based shield alignment must not return.');
  assert.ok(style.includes('vertical-align:-3px!important'), 'Shield needs typographic baseline alignment.');
  assert.ok(style.includes('.reference-header .reference-account-preview'), 'Mobile/tablet account navigation should remain visible.');
  console.log('PASS: accessible login/signup navigation and security icon alignment.');
  console.log('PASS: responsive icon/text alignment regression checks.');
  console.log('PASS: customer and admin route inventory, authentication fallbacks, 404 handling, and premium font system.');

  console.log('PASS: seed preservation, API-backed filtering model, cart reconciliation, wishlist migration, recently viewed, storage safety, and checkout validation.');
} finally {
  await server.close();
}
