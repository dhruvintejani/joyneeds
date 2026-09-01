import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import ProductImage from "../components/common/ProductImage";

export default function Cart() {
  const { items, removeFromCart, increaseQuantity, decreaseQuantity, getCartTotal, getCartCount } =
    useCartStore();

  const total = getCartTotal();
  const count = getCartCount();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-sm"
        >
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-blue-300" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Your cart is empty</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Your cart is waiting for something useful. Explore our catalog and add products you love.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-slate-900 mb-2"
        >
          Shopping Cart
        </motion.h1>
        <p className="text-slate-500 mb-8">
          {count} item{count !== 1 ? "s" : ""}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 flex gap-4 shadow-sm"
                >
                  {/* Product Image */}
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-xl overflow-hidden"
                    aria-label={`View ${item.product.name}`}
                  >
                    <ProductImage
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full p-2"
                      objectFit="contain"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="text-xs text-blue-500 font-medium mb-0.5">
                          {item.product.category}
                        </p>
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="font-semibold text-slate-800 hover:text-blue-600 transition-colors text-sm sm:text-base leading-snug line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="shrink-0 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label={`Remove ${item.product.name} from cart`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => decreaseQuantity(item.product.id)}
                          className="p-2 hover:bg-slate-50 transition-colors text-slate-600 hover:text-slate-900"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1.5 font-semibold text-slate-900 text-sm min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increaseQuantity(item.product.id)}
                          className="p-2 hover:bg-slate-50 transition-colors text-slate-600 hover:text-slate-900"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-slate-400">
                            ₹{item.product.price} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors mt-2"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-fit sticky top-24"
          >
            <h2 className="text-lg font-bold text-slate-900 mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-slate-600 line-clamp-1 max-w-[70%]">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-slate-900 shrink-0">
                    ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Shipping</span>
                <span className="text-slate-500">Calculated at checkout</span>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-xl text-slate-900">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Shipping calculated at checkout
                </p>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors mt-6 shadow-lg shadow-blue-100"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
