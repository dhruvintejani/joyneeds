import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ShieldCheck, Lock, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import ProductImage from "../components/common/ProductImage";

const CheckoutSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long")
    .required("Full name is required"),
  phone: Yup.string()
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .required("Phone number is required"),
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email address is required"),
  address: Yup.string()
    .min(10, "Please enter a complete address")
    .required("Address is required"),
  city: Yup.string()
    .min(2, "City name is too short")
    .required("City is required"),
  state: Yup.string()
    .min(2, "State name is too short")
    .required("State is required"),
  pin: Yup.string()
    .matches(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code")
    .required("PIN code is required"),
});

type CheckoutValues = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin: string;
};

function FieldGroup({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} <span className="text-red-500" aria-hidden="true">*</span>
      </label>
      <Field
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-slate-900 placeholder-slate-400"
      />
      <ErrorMessage
        name={name}
        render={(msg) => (
          <p className="mt-1.5 text-xs text-red-600 font-medium" role="alert">
            {msg}
          </p>
        )}
      />
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCartStore();
  const total = getCartTotal();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-blue-300" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Your cart is empty</h1>
          <p className="text-slate-500 mb-6">
            Add some products before proceeding to checkout.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Browse Shop <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = (values: CheckoutValues) => {
    // Structure prepared for real payment integration (e.g., Razorpay).
    // When a payment backend is connected, this is where the order would be
    // submitted and a payment session initiated.
    // The Razorpay secret key must NEVER appear in frontend code.
    //
    // For this frontend-only version, we navigate to the order-success page
    // and pass customer + order info via router state so no false "payment"
    // is implied — the checkout page itself makes this transparent.

    const orderData = {
      customer: values,
      items: items.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
      })),
      total,
    };

    clearCart();
    navigate("/order-success", { state: { order: orderData } });
  };

  const initialValues: CheckoutValues = {
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pin: "",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-slate-900 mb-2"
        >
          Checkout
        </motion.h1>
        <p className="text-slate-500 mb-8">
          Fill in your details to complete your order.
        </p>

        <Formik
          initialValues={initialValues}
          validationSchema={CheckoutSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form noValidate>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Customer Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
                  >
                    <h2 className="text-lg font-bold text-slate-900 mb-5">
                      Customer Details
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <FieldGroup
                          label="Full Name"
                          name="fullName"
                          placeholder="Enter your full name"
                          autoComplete="name"
                        />
                      </div>
                      <FieldGroup
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        placeholder="10-digit mobile number"
                        autoComplete="tel"
                      />
                      <FieldGroup
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>
                  </motion.div>

                  {/* Shipping Address */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
                  >
                    <h2 className="text-lg font-bold text-slate-900 mb-5">
                      Shipping Address
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <FieldGroup
                          label="Complete Address"
                          name="address"
                          placeholder="House/Flat no., Street, Area"
                          autoComplete="street-address"
                        />
                      </div>
                      <FieldGroup
                        label="City"
                        name="city"
                        placeholder="City"
                        autoComplete="address-level2"
                      />
                      <FieldGroup
                        label="State"
                        name="state"
                        placeholder="State"
                        autoComplete="address-level1"
                      />
                      <FieldGroup
                        label="PIN Code"
                        name="pin"
                        placeholder="6-digit PIN code"
                        autoComplete="postal-code"
                      />
                    </div>
                  </motion.div>

                  {/* Payment Section — Ready for integration */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
                  >
                    <h2 className="text-lg font-bold text-slate-900 mb-2">
                      Payment
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                      <Lock className="w-4 h-4 text-green-500" />
                      <span>Secure payment integration will be connected here</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                      <p className="font-medium mb-1">Payment Coming Soon</p>
                      <p className="text-blue-600 leading-relaxed">
                        Online payment via Razorpay will be enabled shortly. For now, please place your order and our team will get in touch to confirm payment and shipping.
                      </p>
                    </div>
                  </motion.div>

                  {/* Submit */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-4 px-6 rounded-xl transition-colors text-base shadow-lg shadow-blue-100"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Place Order
                  </motion.button>
                </div>

                {/* Order Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-fit sticky top-24"
                >
                  <h2 className="text-lg font-bold text-slate-900 mb-5">Order Summary</h2>

                  <div className="space-y-4 mb-5">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden shrink-0">
                          <ProductImage
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full p-1"
                            objectFit="contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 shrink-0">
                          ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium">₹{total.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Shipping</span>
                      <span className="text-slate-500">Calculated later</span>
                    </div>
                    <div className="border-t border-slate-100 pt-3 flex justify-between">
                      <span className="font-bold text-slate-900">Total</span>
                      <span className="font-bold text-lg text-slate-900">
                        ₹{total.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
