import assert from 'node:assert/strict';
import { createServer } from 'vite';

// Vite transforms the actual TypeScript source; no duplicate test implementation.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { products, categories } = await server.ssrLoadModule('/src/data/products.ts');
  const { selectProducts, matchesSearch, maxQuantity, discount } = await server.ssrLoadModule('/src/utils/catalog.ts');
  const { restoreCart, useCartStore } = await server.ssrLoadModule('/src/store/cartStore.ts');
  const { useDiscoveryStore } = await server.ssrLoadModule('/src/store/discoveryStore.ts');
  const { checkoutSchema } = await server.ssrLoadModule('/src/pages/Checkout.tsx');
  const { safeStorage } = await server.ssrLoadModule('/src/utils/storage.ts');

  assert.equal(products.length, 30, 'Preserve the existing 30-product catalog');
  assert.equal(new Set(products.map(p => p.id)).size, products.length);
  assert.equal(new Set(products.map(p => p.slug)).size, products.length);
  for (const product of products) {
    assert.ok(categories.includes(product.category));
    assert.ok(Number.isFinite(product.price) && product.price >= 0);
  }
  assert.ok(matchesSearch(products[0], 'VEGETABLE kitchen'));
  assert.equal(selectProducts(new URLSearchParams('q=no-such-product-xyz')).length, 0);
  assert.equal(selectProducts(new URLSearchParams('min=garbage&max=NaN')).length, products.length);
  assert.equal(selectProducts(new URLSearchParams('min=500&max=100')).length, 0);
  const ascending = selectProducts(new URLSearchParams('sort=price-asc'));
  assert.ok(ascending.every((p,i) => !i || ascending[i-1].price <= p.price));
  assert.ok(selectProducts(new URLSearchParams(), categories[0]).every(p => p.category === categories[0]));
  assert.equal(discount(products[0]), 0, 'Do not expose unverified discounts');
  assert.equal(maxQuantity({...products[0], stockStatus:'out_of_stock'}), 0);

  assert.deepEqual(restoreCart(null), []);
  assert.deepEqual(restoreCart([null, {}, {product:{id:1},quantity:'99'}, {product:{id:1},quantity:NaN}]), []);
  const restored = restoreCart([{product:{id:1,price:1},quantity:1000}]);
  assert.equal(restored[0].product.price, products[0].price, 'Persisted prices cannot override the catalog');
  assert.equal(restored[0].quantity, 99);
  useCartStore.getState().clearCart();
  assert.equal(useCartStore.getState().addToCart(products[0],2), true);
  assert.equal(useCartStore.getState().getCartCount(),2);
  assert.equal(useCartStore.getState().getCartTotal(),products[0].price*2);
  assert.equal(useCartStore.getState().addToCart(products[0],100),false);
  useCartStore.getState().setQuantity(1,-2);
  assert.equal(useCartStore.getState().getItemQuantity(1),2);
  useCartStore.getState().setQuantity(1,99);
  useCartStore.getState().increaseQuantity(1);
  assert.equal(useCartStore.getState().getItemQuantity(1),99);
  useCartStore.getState().removeFromCart(1);
  assert.equal(useCartStore.getState().getCartCount(),0);

  useDiscoveryStore.getState().toggleWishlist(1);
  assert.deepEqual(useDiscoveryStore.getState().wishlist,[1]);
  useDiscoveryStore.getState().toggleWishlist(1);
  assert.deepEqual(useDiscoveryStore.getState().wishlist,[]);
  for (let id=1; id<=12; id++) useDiscoveryStore.getState().view(id);
  useDiscoveryStore.getState().view(12);
  assert.equal(useDiscoveryStore.getState().recent.length,8);
  assert.equal(new Set(useDiscoveryStore.getState().recent).size,8);
  assert.equal(useDiscoveryStore.getState().recent[0],12);
  assert.equal(safeStorage.getItem('unavailable-storage'),null);
  assert.doesNotThrow(() => safeStorage.setItem('x','{}'));

  assert.equal(await checkoutSchema.isValid({}),false);
  assert.equal(await checkoutSchema.isValid({fullName:'Test Shopper',email:'test@example.com',phone:'9000000000',address:'Test address for validation',city:'Test City',state:'Gujarat',pin:'380001'}),true);
  assert.equal(await checkoutSchema.isValid({fullName:'  ',email:'wrong',phone:'123',address:'short',city:'',state:'',pin:'000000'}),false);
  console.log('PASS: catalog preservation, filters, sorting, quantity limits, stale/corrupt cart recovery, wishlist, recently viewed, unavailable storage, and checkout validation.');
} finally {
  await server.close();
}
