import { useDiscoveryStore } from "../store/discoveryStore";
import { useCatalogStore } from "../store/catalogStore";
import { useCartStore } from "../store/cartStore";
import ProductCard from "../components/product/ProductCard";
import {
  Breadcrumb,
  PageHeading,
  EmptyState,
  Button,
  Skeleton,
} from "../components/common/UI";
import toast from "react-hot-toast";

export default function Wishlist() {
  const ids = useDiscoveryStore((state) => state.wishlist);
  const toggle = useDiscoveryStore((state) => state.toggleWishlist);
  const add = useCartStore((state) => state.addToCart);
  const products = useCatalogStore((state) => state.products);
  const status = useCatalogStore((state) => state.status);
  const items = products.filter((product) => ids.includes(product.id));

  if (status === "idle" || status === "loading") return <Skeleton />;

  return (
    <div className="container section-bottom">
      <Breadcrumb items={[{ label: "Wishlist" }]} />
      <PageHeading title="Your saved finds">
        {items.length} product{items.length !== 1 ? "s" : ""} · Saved on this
        browser
      </PageHeading>
      {items.length ? (
        <div className="product-grid">
          {items.map((product) => (
            <div key={product.id} className="wishlist-item">
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
      ) : (
        <EmptyState title="Keep the good finds close">
          Tap the heart on a product to save it for later.
        </EmptyState>
      )}
    </div>
  );
}
