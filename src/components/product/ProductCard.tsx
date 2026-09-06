import { Link } from "react-router-dom";
import { Heart, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "../../store/cartStore";
import { useDiscoveryStore } from "../../store/discoveryStore";
import type { Product } from "../../data/products";
import { site } from "../../config/site";
import { money, discount, maxQuantity } from "../../utils/catalog";
import ProductImage from "../common/ProductImage";
export default function ProductCard({
  product,
}: {
  product: Product;
  index?: number;
}) {
  const add = useCartStore((s) => s.addToCart);
  const saved = useDiscoveryStore((s) => s.wishlist.includes(product.id));
  const toggle = useDiscoveryStore((s) => s.toggleWishlist);
  const off = discount(product);
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link to={"/product/" + product.slug} tabIndex={-1} aria-hidden="true">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="product-image"
          />
        </Link>
        <button
          className={"icon-button wishlist-toggle " + (saved ? "saved" : "")}
          aria-label={
            (saved ? "Remove " : "Save ") +
            product.name +
            (saved ? " from wishlist" : " to wishlist")
          }
          aria-pressed={saved}
          onClick={() => {
            toggle(product.id);
            toast.success(
              saved ? "Removed from wishlist" : "Saved to wishlist",
            );
          }}
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />
        </button>
        {off > 0 && <span className="product-badge">{off}% off</span>}
        {site.catalogVerified && product.bestseller && (
          <span className="product-badge">Bestseller</span>
        )}
        {product.newArrival && <span className="product-badge">New</span>}
      </div>
      <div className="product-content">
        <p className="eyebrow">{product.category}</p>
        <Link className="product-name" to={"/product/" + product.slug}>
          {product.name}
        </Link>
        {site.catalogVerified &&
          product.rating !== null &&
          product.reviewCount > 0 && (
            <p className="rating">
              ★ {product.rating}{" "}
              <span className="muted">({product.reviewCount})</span>
            </p>
          )}
        <div className="product-bottom">
          <div>
            <strong>{money(product.price)}</strong>
            {off > 0 && <del>{money(product.originalPrice!)}</del>}
          </div>
          <button
            className="icon-button add-button"
            disabled={!maxQuantity(product)}
            aria-label={"Add " + product.name + " to cart"}
            onClick={() => {
              if (add(product)) toast.success("Added to cart");
              else toast.error("Quantity limit reached");
            }}
          >
            <Plus size={20} />
          </button>
        </div>
        {!maxQuantity(product) && (
          <p className="muted small">Currently unavailable</p>
        )}
      </div>
    </article>
  );
}
