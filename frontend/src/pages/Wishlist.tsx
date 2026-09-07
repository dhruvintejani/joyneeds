import { Heart, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useDiscoveryStore } from "../store/discoveryStore";
import { useCatalogStore } from "../store/catalogStore";
import { useCartStore } from "../store/cartStore";
import ProductCard from "../components/product/ProductCard";
import { Breadcrumb, EmptyState, Button, Skeleton } from "../components/common/UI";
import { PageBanner } from "../components/common/ReferenceUI";

export default function Wishlist() {
  const ids = useDiscoveryStore((state) => state.wishlist);
  const toggle = useDiscoveryStore((state) => state.toggleWishlist);
  const add = useCartStore((state) => state.addToCart);
  const products = useCatalogStore((state) => state.products);
  const status = useCatalogStore((state) => state.status);
  const items = products.filter((product) => ids.includes(product.id));

  if (status === "idle" || status === "loading") return <Skeleton />;

  return (
    <div className="container reference-wishlist-page section-bottom">
      <Breadcrumb items={[{ label: "Wishlist" }]} />
      <PageBanner
        eyebrow="SAVED FOR LATER"
        title="My Wishlist"
        subtitle="Keep useful finds together and move them to your cart whenever you’re ready."
        compact
      />

      {items.length ? (
        <div className="reference-wishlist-layout">
          <section>
            <div className="reference-wishlist-toolbar">
              <strong>{items.length} item{items.length !== 1 ? "s" : ""}</strong>
              <div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    let moved = 0;
                    for (const product of items) {
                      if (add(product)) {
                        toggle(product.id);
                        moved += 1;
                      }
                    }
                    if (moved) toast.success(`${moved} item${moved !== 1 ? "s" : ""} moved to cart`);
                    else toast.error("Unable to move these items right now");
                  }}
                >
                  <ShoppingCart size={17} /> Move all to cart
                </Button>
                <button
                  className="reference-link"
                  onClick={() => items.forEach((product) => toggle(product.id))}
                >
                  Clear all
                </button>
              </div>
            </div>
            <div className="product-grid reference-wishlist-grid">
              {items.map((product) => (
                <div key={product.id} className="wishlist-item reference-wishlist-item">
                  <ProductCard product={product} />
                  <Button
                    className="full-width move-button"
                    variant="secondary"
                    disabled={product.stockStatus === "out_of_stock"}
                    onClick={() => {
                      if (add(product)) {
                        toggle(product.id);
                        toast.success("Moved to cart");
                      } else {
                        toast.error("Unable to add more of this product");
                      }
                    }}
                  >
                    Move to cart
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <aside className="reference-wishlist-aside">
            <section className="reference-info-card">
              <span className="reference-info-icon"><Heart size={24} /></span>
              <h2>Why Wishlist?</h2>
              <ul>
                <li>Save products you want to revisit</li>
                <li>Keep track of useful finds on this browser</li>
                <li>Move products to your cart anytime</li>
              </ul>
            </section>
            <section className="reference-wishlist-cta">
              <p className="reference-kicker">KEEP DISCOVERING</p>
              <h2>Find another useful everyday essential</h2>
              <p>Explore the full JoyNeeds collection.</p>
              <Link className="button primary" to="/shop">Shop All Products</Link>
            </section>
          </aside>
        </div>
      ) : (
        <EmptyState title="Keep the good finds close">
          Tap the heart on a product to save it for later.
        </EmptyState>
      )}
    </div>
  );
}
