import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { products, categorySlugMap, categoryDescriptions, categoryIcons } from "../data/products";
import ProductCard from "../components/product/ProductCard";
import NotFound from "./NotFound";

export default function Category() {
  const { category: categorySlug } = useParams<{ category: string }>();

  const categoryName = categorySlug ? categorySlugMap[categorySlug] : null;

  if (!categoryName) {
    return <NotFound />;
  }

  const categoryProducts = products.filter((p) => p.category === categoryName);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
            aria-label="Back to shop"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-4xl" aria-hidden="true">
              {categoryIcons[categoryName]}
            </span>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1"
              >
                {categoryName}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-slate-500 text-sm sm:text-base"
              >
                {categoryDescriptions[categoryName]}
              </motion.p>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-sm text-slate-400"
          >
            {categoryProducts.length} product{categoryProducts.length !== 1 ? "s" : ""}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {categoryProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <PackageSearch className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 mb-2">No products yet</h2>
            <p className="text-slate-500 mb-6">
              This category doesn't have any products at the moment.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {categoryProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
