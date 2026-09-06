import { products } from "../data/products";
import { useDiscoveryStore } from "../store/discoveryStore";
import { useCartStore } from "../store/cartStore";
import ProductCard from "../components/product/ProductCard";
import {
  Breadcrumb,
  PageHeading,
  EmptyState,
  Button,
} from "../components/common/UI";
import toast from "react-hot-toast";
export default function Wishlist() {
  const ids = useDiscoveryStore((s) => s.wishlist),
    toggle = useDiscoveryStore((s) => s.toggleWishlist),
    add = useCartStore((s) => s.addToCart);
  const items = products.filter((p) => ids.includes(p.id));
  return (
    <div className="container section-bottom">
      <Breadcrumb items={[{ label: "Wishlist" }]} />
      <PageHeading title="Your saved finds">
        {items.length} product{items.length !== 1 ? "s" : ""} · Saved on this
        browser
      </PageHeading>
      {items.length ? (
        <div className="product-grid">
          {items.map((p) => (
            <div key={p.id} className="wishlist-item">
              <ProductCard product={p} />
              <Button
                className="full-width move-button"
                variant="secondary"
                disabled={p.stockStatus === "out_of_stock"}
                onClick={() => {
                  if (add(p)) {
                    toggle(p.id);
                    toast.success("Moved to cart");
                  } else toast.error("Unable to add more of this product");
                }}
              >
                Move to cart
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Keep the good finds close">
          Tap the heart on a product to save it for later.
        </EmptyState>
      )}
    </div>
  );
}
