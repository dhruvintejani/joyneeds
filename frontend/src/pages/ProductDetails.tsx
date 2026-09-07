import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
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

export default function ProductDetails() {
  const { slug } = useParams();
  const products = useCatalogStore((state) => state.products);
  const categories = useCatalogStore((state) => state.categories);
  const status = useCatalogStore((state) => state.status);
  const product = products.find((item) => item.slug === slug);

  if (status === "idle" || status === "loading") return <Skeleton />;
  if (!product)
    return (
      <div className="container">
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
  const addItem = (buy = false) => {
    if (add(product, quantity)) {
      toast.success("Added to cart");
      if (buy) navigate("/checkout");
    } else {
      toast.error("Please reduce the quantity; your cart is at the limit.");
    }
  };
  const related = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);
  const recently = recent
    .filter((id) => id !== product.id)
    .map((id) => products.find((item) => item.id === id))
    .filter((item): item is Product => !!item)
    .slice(0, 4);

  return (
    <div className="container">
      <Breadcrumb
        items={[
          { label: "Shop", to: "/shop" },
          {
            label: product.category,
            to: "/category/" + categorySlug,
          },
          { label: product.name },
        ]}
      />
      <div className="detail-grid">
        <div>
          <div className="main-product-image">
            <ProductImage
              src={gallery[photo] || gallery[0]}
              alt={product.name}
              priority
              className="detail-photo"
            />
          </div>
          {gallery.length > 1 && (
            <div className="thumbnails">
              {gallery.map((src, index) => (
                <button
                  key={src + index}
                  className={photo === index ? "selected" : ""}
                  aria-label={"View photo " + (index + 1)}
                  aria-pressed={photo === index}
                  onClick={() => setPhoto(index)}
                >
                  <ProductImage
                    src={src}
                    alt={product.name + " view " + (index + 1)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="product-info">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          {site.catalogVerified &&
            product.rating !== null &&
            product.reviewCount > 0 && (
              <p>
                ★ {product.rating} · {product.reviewCount} reviews
              </p>
            )}
          <div className="detail-price">
            <strong>{money(product.price)}</strong>
            {off > 0 && (
              <>
                <del>{money(product.originalPrice!)}</del>
                <span className="badge">Save {off}%</span>
              </>
            )}
          </div>
          <p className="muted">{product.shortDescription}</p>
          <p className="stock-label">
            {limit ? "Available in the catalog" : "Currently unavailable"}
          </p>
          {!site.catalogVerified && (
            <p className="notice small">
              Catalog information is awaiting confirmation. Orders are not open.
            </p>
          )}
          <div className="purchase-row">
            <QuantitySelector
              value={quantity}
              max={remaining}
              onChange={setQuantity}
            />
            <Button disabled={remaining < quantity} onClick={() => addItem()}>
              Add to cart <ArrowRight size={17} />
            </Button>
            <button
              className={"icon-button save-detail " + (saved ? "saved" : "")}
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={saved}
              onClick={() => {
                toggle(product.id);
                toast.success(
                  saved ? "Removed from wishlist" : "Saved to wishlist",
                );
              }}
            >
              <Heart fill={saved ? "currentColor" : "none"} size={20} />
            </button>
          </div>
          <Button
            className="full-width"
            variant="secondary"
            disabled={remaining < quantity}
            onClick={() => addItem(true)}
          >
            Buy now · review checkout
          </Button>
          <p className="muted small">No payment is taken in this preview.</p>
          <dl className="product-meta">
            <div>
              <dt>SKU</dt>
              <dd>{product.sku}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{site.shippingTimelines || pendingPolicy}</dd>
            </div>
            <div>
              <dt>Returns</dt>
              <dd>
                {site.returnWindow || pendingPolicy}{" "}
                <Link to="/return-policy" className="text-link">
                  Read policy
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <section className="details-section">
        <details open>
          <summary>Product details</summary>
          <p>{product.fullDescription || product.shortDescription}</p>
          <ul>
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </details>
        <details>
          <summary>Specifications</summary>
          {product.specifications && Object.keys(product.specifications).length ? (
            <dl className="product-meta">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p>
              Additional specifications have not been supplied. Contact us if
              you need a specific detail.
            </p>
          )}
        </details>
        <details>
          <summary>Shipping & returns</summary>
          <p>{site.shippingTimelines || pendingPolicy}</p>
          <p>{site.returnWindow || pendingPolicy}</p>
          <Link to="/shipping-policy" className="text-link">
            Shipping policy
          </Link>{" "}
          ·{" "}
          <Link className="text-link" to="/return-policy">
            Return policy
          </Link>
        </details>
      </section>
      {[
        { list: related, title: "You might also find useful" },
        { list: recently, title: "Recently viewed" },
      ].map(
        ({ list, title }) =>
          list.length > 0 && (
            <section className="section" key={title}>
              <div className="section-heading">
                <h2>{title}</h2>
              </div>
              <div className="product-grid">
                {list.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </section>
          ),
      )}
    </div>
  );
}
