import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  FileCheck2,
  Heart,
  PackageCheck,
  ShoppingCart,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Product } from "../types/catalog";
import { useCatalogStore } from "../store/catalogStore";
import { useCartStore } from "../store/cartStore";
import { useDiscoveryStore } from "../store/discoveryStore";
import { money, discount, maxQuantity } from "../utils/catalog";
import { site, pendingPolicy } from "../config/site";
import ProductImage from "../components/common/ProductImage";
import ProductCard from "../components/product/ProductCard";
import {
  Breadcrumb,
  Button,
  EmptyState,
  QuantitySelector,
  Skeleton,
} from "../components/common/UI";
import { SectionHeading } from "../components/common/ReferenceUI";

export default function ProductDetails() {
  const { slug } = useParams();
  const products = useCatalogStore((state) => state.products);
  const categories = useCatalogStore((state) => state.categories);
  const status = useCatalogStore((state) => state.status);
  const product = products.find((item) => item.slug === slug);

  if (status === "idle" || status === "loading") return <Skeleton />;
  if (!product)
    return (
      <div className="container section-bottom">
        <EmptyState title="Product not found">
          This product may no longer be in the collection.
        </EmptyState>
      </div>
    );

  return (
    <ProductView
      key={product.id}
      product={product}
      products={products}
      categorySlug={
        categories.find((category) => category.name === product.category)?.slug ||
        product.categorySlug
      }
    />
  );
}

function ProductView({
  product,
  products,
  categorySlug,
}: {
  product: Product;
  products: Product[];
  categorySlug: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [photo, setPhoto] = useState(0);
  const add = useCartStore((state) => state.addToCart);
  const current = useCartStore((state) => state.getItemQuantity(product.id));
  const saved = useDiscoveryStore((state) => state.wishlist.includes(product.id));
  const recent = useDiscoveryStore((state) => state.recent);
  const view = useDiscoveryStore((state) => state.view);
  const toggle = useDiscoveryStore((state) => state.toggleWishlist);
  const navigate = useNavigate();

  useEffect(() => {
    view(product.id);
  }, [product.id, view]);

  const gallery = product.images.length ? product.images : [product.image];
  const limit = maxQuantity(product);
  const remaining = Math.max(0, limit - current);
  const off = discount(product);
  const related = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);
  const recently = recent
    .filter((id) => id !== product.id)
    .map((id) => products.find((item) => item.id === id))
    .filter((item): item is Product => !!item)
    .slice(0, 4);

  const addItem = (buy = false) => {
    if (add(product, quantity)) {
      toast.success("Added to cart");
      if (buy) navigate("/checkout");
    } else {
      toast.error("Please reduce the quantity; your cart is at the limit.");
    }
  };

  return (
    <div className="container reference-product-page section-bottom">
      <Breadcrumb
        items={[
          { label: "Shop", to: "/shop" },
          { label: product.category, to: `/category/${categorySlug}` },
          { label: product.name },
        ]}
      />

      <section className="reference-product-detail">
        <div className="reference-product-gallery">
          {gallery.length > 1 && (
            <div className="reference-thumbnails" aria-label="Product images">
              {gallery.map((src, index) => (
                <button
                  key={src + index}
                  className={photo === index ? "selected" : ""}
                  aria-label={`View photo ${index + 1}`}
                  aria-pressed={photo === index}
                  onClick={() => setPhoto(index)}
                >
                  <ProductImage src={src} alt={`${product.name} view ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
          <div className="reference-main-product-image">
            <ProductImage
              src={gallery[photo] || gallery[0]}
              alt={product.name}
              priority
              className="detail-photo"
            />
          </div>
        </div>

        <div className="reference-product-info">
          <p className="reference-kicker">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="reference-product-lead">{product.shortDescription}</p>

          {site.catalogVerified && product.rating !== null && product.reviewCount > 0 && (
            <p className="reference-rating">★ {product.rating} <span>({product.reviewCount} reviews)</span></p>
          )}

          <div className="reference-detail-price">
            <strong>{money(product.price)}</strong>
            {off > 0 && product.originalPrice && (
              <>
                <del>{money(product.originalPrice)}</del>
                <span className="reference-badge green">{off}% off</span>
              </>
            )}
          </div>

          <div className={`reference-stock-card ${limit ? "available" : "unavailable"}`}>
            <PackageCheck size={20} />
            <div>
              <strong>{limit ? "Available in the catalog" : "Currently unavailable"}</strong>
              <span>{product.sku ? `SKU ${product.sku}` : "Product availability"}</span>
            </div>
          </div>

          {!site.catalogVerified && (
            <p className="notice small">
              Catalog information is awaiting confirmation. Orders are not open.
            </p>
          )}

          <div className="reference-purchase-controls">
            <div>
              <label>Quantity</label>
              <QuantitySelector value={quantity} max={remaining} onChange={setQuantity} />
            </div>
            <Button disabled={remaining < quantity} onClick={() => addItem()}>
              <ShoppingCart size={17} /> Add to Cart
            </Button>
            <button
              className={`reference-save-button ${saved ? "saved" : ""}`}
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={saved}
              onClick={() => {
                toggle(product.id);
                toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
              }}
            >
              <Heart size={19} fill={saved ? "currentColor" : "none"} />
              {saved ? "Saved" : "Add to Wishlist"}
            </button>
          </div>

          <Button
            className="full-width reference-buy-button"
            variant="secondary"
            disabled={remaining < quantity}
            onClick={() => addItem(true)}
          >
            Review checkout <ArrowRight size={17} />
          </Button>

          <div className="reference-detail-trust">
            <Link to="/shipping-policy">
              <FileCheck2 size={21} />
              <span><strong>Shipping</strong><small>{site.shippingTimelines || "Details pending confirmation"}</small></span>
            </Link>
            <Link to="/return-policy">
              <PackageCheck size={21} />
              <span><strong>Returns</strong><small>{site.returnWindow || "Policy details pending confirmation"}</small></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="reference-product-tabs">
        <details open>
          <summary>Description</summary>
          <div className="reference-detail-panel">
            <div>
              <h2>Product Description</h2>
              <p>{product.fullDescription || product.shortDescription}</p>
              {product.features.length > 0 && (
                <ul>
                  {product.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
              )}
            </div>
          </div>
        </details>
        <details>
          <summary>Specifications</summary>
          <div className="reference-detail-panel">
            {product.specifications && Object.keys(product.specifications).length ? (
              <dl className="reference-spec-list">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key}><dt>{key}</dt><dd>{value}</dd></div>
                ))}
              </dl>
            ) : (
              <p>Additional specifications have not been supplied yet.</p>
            )}
          </div>
        </details>
        <details>
          <summary>Shipping & Returns</summary>
          <div className="reference-detail-panel">
            <p>{site.shippingTimelines || pendingPolicy}</p>
            <p>{site.returnWindow || pendingPolicy}</p>
            <Link className="reference-link" to="/shipping-policy">Shipping policy</Link>{" · "}
            <Link className="reference-link" to="/return-policy">Return policy</Link>
          </div>
        </details>
      </section>

      {related.length > 0 && (
        <section className="reference-section">
          <SectionHeading title="You May Also Like" to="/shop" linkLabel="View all products" />
          <div className="product-grid reference-related-grid">
            {related.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      )}

      {recently.length > 0 && (
        <section className="reference-section">
          <SectionHeading title="Recently Viewed" />
          <div className="product-grid reference-related-grid">
            {recently.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      )}
    </div>
  );
}
