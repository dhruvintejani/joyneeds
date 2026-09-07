import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Heart, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "../store/cartStore";
import { useDiscoveryStore } from "../store/discoveryStore";
import { maxQuantity, money } from "../utils/catalog";
import { site } from "../config/site";
import ProductImage from "../components/common/ProductImage";
import {
  Breadcrumb,
  EmptyState,
  QuantitySelector,
  Button,
  Drawer,
} from "../components/common/UI";

export default function Cart() {
  const { items, setQuantity, removeFromCart, clearCart, getCartTotal } = useCartStore();
  const toggleWishlist = useDiscoveryStore((state) => state.toggleWishlist);
  const wishlist = useDiscoveryStore((state) => state.wishlist);
  const [confirm, setConfirm] = useState(false);
  const total = getCartTotal();
  const blocked = items.some((item) => !maxQuantity(item.product));
  const savings = site.catalogVerified
    ? items.reduce(
        (sum, item) =>
          sum +
          Math.max(
            0,
            (item.product.originalPrice ?? item.product.price) - item.product.price,
          ) * item.quantity,
        0,
      )
    : 0;

  return (
    <div className="container reference-cart-page section-bottom">
      <Breadcrumb items={[{ label: "Cart" }]} />

      <div className="reference-cart-heading">
        <div>
          <p className="reference-kicker">YOUR BAG</p>
          <h1>Your Cart</h1>
          <p>{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>
        </div>
        <span className="reference-script">Good choices. Brighter days.</span>
      </div>

      {!items.length ? (
        <EmptyState title="Your cart is waiting">
          Browse the collection and add what catches your eye.
        </EmptyState>
      ) : (
        <div className="reference-cart-layout">
          <section className="reference-cart-items" aria-label="Cart items">
            {items.map(({ product, quantity }) => (
              <article className="reference-cart-item" key={product.id}>
                <Link className="reference-cart-image" to={`/product/${product.slug}`}>
                  <ProductImage src={product.image} alt={product.name} />
                </Link>

                <div className="reference-cart-copy">
                  <Link to={`/product/${product.slug}`}>
                    <h2>{product.name}</h2>
                  </Link>
                  <p>{product.subcategory || product.category}</p>
                  <strong>{money(product.price)}</strong>
                  <span className={maxQuantity(product) ? "reference-stock-text" : "field-error"}>
                    {maxQuantity(product) ? "Available" : "Currently unavailable"}
                  </span>
                </div>

                <QuantitySelector
                  value={quantity}
                  max={maxQuantity(product)}
                  onChange={(value) => {
                    setQuantity(product.id, value);
                    toast.success("Quantity updated", { id: "quantity" });
                  }}
                />

                <div className="reference-cart-actions">
                  <button
                    type="button"
                    onClick={() => {
                      if (!wishlist.includes(product.id)) toggleWishlist(product.id);
                      removeFromCart(product.id);
                      toast.success("Moved to wishlist");
                    }}
                  >
                    <Heart size={17} /> Move to Wishlist
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removeFromCart(product.id);
                      toast.success("Removed from cart");
                    }}
                  >
                    <Trash2 size={17} /> Remove
                  </button>
                </div>
              </article>
            ))}

            <div className="reference-cart-links">
              <Link to="/shop" className="reference-link">
                <ArrowLeft size={16} /> Continue Shopping
              </Link>
              <Button variant="ghost" onClick={() => setConfirm(true)}>Clear cart</Button>
            </div>
          </section>

          <aside className="reference-summary-card">
            <h2>Order Summary</h2>
            <dl>
              <div><dt>Subtotal</dt><dd>{money(total)}</dd></div>
              {savings > 0 && <div><dt>Savings</dt><dd>- {money(savings)}</dd></div>}
              <div>
                <dt>Shipping</dt>
                <dd>{site.shippingFee === null ? "To be confirmed" : money(site.shippingFee)}</dd>
              </div>
              <div className="reference-summary-total">
                <dt>Estimated total</dt>
                <dd>{money(total + (site.shippingFee ?? 0))}</dd>
              </div>
            </dl>
            <p className="muted small">
              {site.shippingFee === null
                ? "Shipping and final charges must be confirmed before payments are enabled."
                : "No payment is taken in this preview."}
            </p>
            {blocked ? (
              <p role="status" className="notice">Remove unavailable items to continue.</p>
            ) : (
              <Link className="button primary full-width" to="/checkout">
                Proceed to Checkout <ArrowRight size={17} />
              </Link>
            )}
            <div className="reference-summary-assurance">
              <span>Guest checkout</span>
              <span>Cart saved on this browser</span>
              <span>Payment not enabled yet</span>
            </div>
          </aside>
        </div>
      )}

      <section className="reference-cart-banner">
        <div>
          <p className="reference-kicker">KEEP EXPLORING</p>
          <h2>Complete your everyday essentials</h2>
          <p>Find more useful products across the JoyNeeds collection.</p>
        </div>
        <Link className="button secondary" to="/shop">
          Explore More Products <ArrowRight size={17} />
        </Link>
      </section>

      <Drawer title="Clear your cart?" open={confirm} onClose={() => setConfirm(false)}>
        <p>This removes all products from your shopping cart.</p>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setConfirm(false)}>Keep items</Button>
          <Button
            variant="danger"
            onClick={() => {
              clearCart();
              setConfirm(false);
              toast.success("Cart cleared");
            }}
          >
            Clear cart
          </Button>
        </div>
      </Drawer>
    </div>
  );
}
