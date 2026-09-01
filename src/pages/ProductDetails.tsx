import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Zap,
  ArrowLeft,
  CheckCircle,
  Truck,
  RefreshCcw,
  Tag,
  Minus,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { products, categoryToSlug } from "../data/products";
import { useCartStore } from "../store/cartStore";
import ProductImage from "../components/common/ProductImage";
import ProductCard from "../components/product/ProductCard";
import NotFound from "./NotFound";

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const addToCart = useCartStore((s) => s.addToCart);
  const [qty, setQty] = useState(1);

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return <NotFound />;
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addToCart(product);
    }
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) {
      addToCart(product);
    }
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-slate-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-slate-600 transition-colors">Shop</Link>
          <span>/</span>
          <Link
            to={`/category/${categoryToSlug[product.category]}`}
            className="hover:text-slate-600 transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-slate-600 font-medium line-clamp-1">{product.name}</span>
        </nav>

        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-50 rounded-3xl overflow-hidden aspect-square flex items-center justify-center p-8"
          >
            <ProductImage
              src={product.image}
              alt={product.name}
              className="w-full h-full max-h-[480px]"
              objectFit="contain"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            {/* Category & SKU */}
            <div className="flex items-center justify-between mb-3">
              <Link
                to={`/category/${categoryToSlug[product.category]}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider"
              >
                {product.category}
              </Link>
              <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-4">
              {product.name}
            </h1>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-5">
              {product.stockStatus === "in_stock" ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">In Stock</span>
                </>
              ) : (
                <>
                  <span className="w-4 h-4 rounded-full bg-red-200 inline-block" />
                  <span className="text-sm font-medium text-red-600">Out of Stock</span>
                </>
              )}
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-extrabold text-slate-900">₹{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-slate-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    -{product.discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-slate-600 leading-relaxed mb-6">
              {product.shortDescription}
            </p>

            {/* Features */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">
                Key Features
              </h2>
              <ul className="space-y-2">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity */}
            {product.stockStatus === "in_stock" && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="p-2.5 hover:bg-slate-50 transition-colors text-slate-600 hover:text-slate-900"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 py-2 font-semibold text-slate-900 min-w-[40px] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="p-2.5 hover:bg-slate-50 transition-colors text-slate-600 hover:text-slate-900"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={product.stockStatus === "out_of_stock"}
                className={`flex-1 inline-flex items-center justify-center gap-2 font-semibold py-3.5 px-6 rounded-xl transition-colors ${
                  product.stockStatus === "out_of_stock"
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100"
                }`}
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </motion.button>
              {product.stockStatus === "in_stock" && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBuyNow}
                  className="flex-1 inline-flex items-center justify-center gap-2 font-semibold py-3.5 px-6 rounded-xl border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
                  aria-label="Buy now"
                >
                  <Zap className="w-5 h-5" />
                  Buy Now
                </motion.button>
              )}
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-2 mb-6">
                <Tag className="w-4 h-4 text-slate-400" aria-label="Tags" />
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Shipping & Returns */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-600">{product.shippingInfo}</p>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCcw className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-600">{product.returnInfo}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-slate-100 pt-12">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-slate-900 mb-6"
            >
              Related Products
            </motion.h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
