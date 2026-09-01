import { useLocation, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ShoppingBag, Mail, Phone, ArrowRight } from "lucide-react";

type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type OrderData = {
  customer: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pin: string;
  };
  items: OrderItem[];
  total: number;
};

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order as OrderData | undefined;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-9 h-9 text-blue-600" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Thank you, {order.customer.fullName}. Your order has been received. Our team will reach out to confirm payment and shipping details.
            </p>
          </div>

          <div className="px-6 sm:px-8 py-6">
            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
              <p className="font-semibold mb-1">Next Steps</p>
              <p className="leading-relaxed">
                We'll contact you on <span className="font-medium">{order.customer.phone}</span> or at <span className="font-medium">{order.customer.email}</span> to confirm your order and arrange payment.
              </p>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-500" />
                Order Items
              </h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between">
                <span className="font-bold text-slate-900">Order Total</span>
                <span className="font-bold text-lg text-blue-700">
                  ₹{order.total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="mb-6 p-4 bg-slate-50 rounded-xl">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Delivery Address</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {order.customer.address}, {order.customer.city},{" "}
                {order.customer.state} — {order.customer.pin}
              </p>
            </div>

            {/* Contact Info */}
            <div className="mb-8 bg-blue-50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Need Help?</h3>
              <div className="space-y-2">
                <a
                  href="mailto:dhruvintejani.work@gmail.com"
                  className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  dhruvintejani.work@gmail.com
                </a>
                <a
                  href="tel:9913871759"
                  className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  9913871759
                </a>
              </div>
            </div>

            <Link
              to="/shop"
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors shadow-lg shadow-blue-100"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
