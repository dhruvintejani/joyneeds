import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "../../store/cartStore";
import { useDiscoveryStore } from "../../store/discoveryStore";
import type { Product } from "../../types/catalog";
import { site } from "../../config/site";
import { discount, maxQuantity, money } from "../../utils/catalog";
import ProductImage from "../common/ProductImage";

export default function ProductCard({ product }: { product: Product; index?: number }) {
  const add = useCartStore((state) => state.addToCart);
  const saved = useDiscoveryStore((state) => state.wishlist.includes(product.id));
  const toggle = useDiscoveryStore((state) => state.toggleWishlist);
  const off = discount(product);
  const available = maxQuantity(product) > 0;

  return (
    <motion.article
      className="product-card reference-product-card"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="product-image-wrap reference-product-image-wrap">
        <Link to={`/product/${product.slug}`} tabIndex={-1} aria-hidden="true">
          <ProductImage src={product.image} alt={product.name} className="product-image" />
        </Link>
        <button
          className={`reference-wishlist-button ${saved ? "saved" : ""}`}
          aria-label={`${saved ? "Remove" : "Save"} ${product.name} ${saved ? "from" : "to"} wishlist`}
          aria-pressed={saved}
          onClick={() => {
            toggle(product.id);
            toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
          }}
        >
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
        {(product.newArrival || off > 0 || (site.catalogVerified && product.bestseller)) && (
          <div className="reference-product-badges" aria-label="Product highlights">
            {product.newArrival && <span className="reference-badge green">New</span>}
            {off > 0 && <span className="reference-badge green">{off}% off</span>}
            {site.catalogVerified && product.bestseller && (
              <span className="reference-badge gold">Bestseller</span>
            )}
          </div>
        )}
      </div>

      <div className="reference-product-content">
        <Link className="reference-product-name" to={`/product/${product.slug}`}>
          {product.name}
        </Link>
        <p className="reference-product-meta">
          {product.subcategory || product.category}
        </p>
        {site.catalogVerified && product.rating !== null && product.reviewCount > 0 && (
          <p className="reference-rating">
            ★ {product.rating} <span>({product.reviewCount})</span>
          </p>
        )}
        <div className="reference-product-price">
          <strong>{money(product.price)}</strong>
          {off > 0 && product.originalPrice && <del>{money(product.originalPrice)}</del>}
        </div>
        <button
          className="reference-add-button"
          disabled={!available}
          aria-label={`Add ${product.name} to cart`}
          onClick={() => {
            if (add(product)) toast.success("Added to cart");
            else toast.error("Quantity limit reached");
          }}
        >
          <ShoppingCart size={17} />
          {available ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </motion.article>
  );
}
