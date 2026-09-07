import assert from 'node:assert/strict';
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
  console.log('PASS: seed preservation, API-backed filtering model, cart reconciliation, wishlist migration, recently viewed, storage safety, and checkout validation.');
} finally {
  await server.close();
}
