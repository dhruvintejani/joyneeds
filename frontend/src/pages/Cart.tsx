import { Link } from "react-router-dom";
import { useState } from "react";
import { Trash2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "../store/cartStore";
import { money, maxQuantity } from "../utils/catalog";
import { site } from "../config/site";
import ProductImage from "../components/common/ProductImage";
import {
  Breadcrumb,
  PageHeading,
  EmptyState,
  QuantitySelector,
  Button,
  Drawer,
} from "../components/common/UI";
export default function Cart() {
  const { items, setQuantity, removeFromCart, clearCart, getCartTotal } =
    useCartStore();
  const [confirm, setConfirm] = useState(false);
  const total = getCartTotal(),
    blocked = items.some((i) => !maxQuantity(i.product));
  const savings = site.catalogVerified
    ? items.reduce(
        (sum, i) =>
          sum +
          Math.max(
            0,
            (i.product.originalPrice ?? i.product.price) - i.product.price,
          ) *
            i.quantity,
        0,
      )
    : 0;
  return (
    <div className="container section-bottom">
      <Breadcrumb items={[{ label: "Cart" }]} />
      <PageHeading title="Your shopping bag">
        {items.length
          ? "Your everyday finds, all in one place."
          : "A little room for something useful."}
      </PageHeading>
      {!items.length ? (
        <EmptyState title="Your bag is waiting">
          Browse the collection and add what catches your eye.
        </EmptyState>
      ) : (
        <div className="cart-layout">
          <div>
            <div className="cart-list">
              {items.map(({ product: p, quantity }) => (
                <article className="cart-row" key={p.id}>
                  <Link to={"/product/" + p.slug}>
                    <ProductImage
                      src={p.image}
                      alt={p.name}
                      className="cart-photo"
                    />
                  </Link>
                  <div className="cart-description">
                    <p className="eyebrow">{p.category}</p>
                    <Link to={"/product/" + p.slug}>
                      <h2>{p.name}</h2>
                    </Link>
                    <p>{money(p.price)} each</p>
                    {!maxQuantity(p) && (
                      <p className="field-error">
                        Unavailable. Remove this item to continue.
                      </p>
                    )}
                    <QuantitySelector
                      value={quantity}
                      max={maxQuantity(p)}
                      onChange={(value) => {
                        setQuantity(p.id, value);
                        toast.success("Quantity updated", { id: "quantity" });
                      }}
                    />
                  </div>
                  <div className="cart-row-end">
                    <strong>{money(p.price * quantity)}</strong>
                    <button
                      className="icon-button"
                      aria-label={"Remove " + p.name}
                      onClick={() => {
                        removeFromCart(p.id);
                        toast.success("Removed from cart");
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-links">
              <Link to="/shop" className="text-link">
                Continue shopping
              </Link>
              <Button variant="ghost" onClick={() => setConfirm(true)}>
                Clear bag
              </Button>
            </div>
          </div>
          <aside className="order-summary">
            <h2>Order summary</h2>
            <dl>
              <div>
                <dt>Subtotal</dt>
                <dd>{money(total)}</dd>
              </div>
              {savings > 0 && (
                <div>
                  <dt>Savings</dt>
                  <dd>{money(savings)}</dd>
                </div>
              )}
              <div>
                <dt>Shipping</dt>
                <dd>
                  {site.shippingFee === null
                    ? "Not yet confirmed"
                    : money(site.shippingFee)}
                </dd>
              </div>
              <div className="summary-total">
                <dt>Estimated total</dt>
                <dd>{money(total + (site.shippingFee ?? 0))}</dd>
              </div>
            </dl>
            <p className="muted small">
              {site.shippingFee === null
                ? "Excludes shipping. The final payable amount is not yet available."
                : "No payment is taken in this preview."}
            </p>
            {blocked ? (
              <p role="status" className="notice">
                Remove unavailable items to continue.
              </p>
            ) : (
              <Link className="button primary full-width" to="/checkout">
                Review checkout <ArrowRight size={17} />
              </Link>
            )}
            <p className="muted small">
              Orders are not open yet. Your bag stays saved on this browser.
            </p>
          </aside>
        </div>
      )}
      <Drawer
        title="Clear your bag?"
        open={confirm}
        onClose={() => setConfirm(false)}
      >
        <p>This removes all products from your shopping bag.</p>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            Keep items
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              clearCart();
              setConfirm(false);
              toast.success("Bag cleared");
            }}
          >
            Clear bag
          </Button>
        </div>
      </Drawer>
    </div>
  );
}
