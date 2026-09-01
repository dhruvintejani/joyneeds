import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Eye, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "../../store/cartStore";
import type { Product } from "../../data/products";
import ProductImage from "../common/ProductImage";

type Props = {
  product: Product;
  index?: number;
};

export default function ProductCard({ product, index = 0 }: Props) {
  const addToCart = useCartStore((s) => s.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.discountPercentage > 0 && (
          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{product.discountPercentage}%
          </span>
        )}
        {product.bestseller && (
          <span className="bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
            Bestseller
          </span>
        )}
        {product.stockStatus === "out_of_stock" && (
          <span className="bg-slate-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Out of Stock
          </span>
        )}
      </div>

      {/* Image */}
      <Link
        to={`/product/${product.slug}`}
        className="block overflow-hidden bg-slate-50"
        tabIndex={-1}
        aria-hidden="true"
      >
        <motion.div
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.3 }}
          className="aspect-square"
        >
          <ProductImage
            src={product.image}
            alt={product.name}
            className="w-full h-full p-4"
            objectFit="contain"
          />
        </motion.div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-blue-500 font-medium uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <Link
          to={`/product/${product.slug}`}
          className="font-semibold text-slate-800 text-sm leading-snug hover:text-blue-600 transition-colors line-clamp-2 mb-1"
        >
          {product.name}
        </Link>

        {/* Rating — only shown if not null */}
        {product.rating !== null && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-slate-600 font-medium">{product.rating}</span>
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-center gap-2 mt-auto mb-3">
          <span className="text-base font-bold text-slate-900">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-slate-400 line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={product.stockStatus === "out_of_stock"}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl transition-colors ${
              product.stockStatus === "out_of_stock"
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add to Cart</span>
            <span className="sm:hidden">Add</span>
          </motion.button>
          <Link
            to={`/product/${product.slug}`}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
            aria-label={`View ${product.name} details`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
