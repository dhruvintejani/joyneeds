import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-extrabold text-slate-100 select-none mb-2">404</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
          Page not found
        </h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 border-2 border-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse Shop
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
