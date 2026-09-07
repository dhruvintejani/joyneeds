import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import {
  Check,
  CreditCard,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { money, maxQuantity } from "../utils/catalog";
import { site } from "../config/site";
import FormField from "../components/common/FormField";
import ProductImage from "../components/common/ProductImage";
import { Breadcrumb, EmptyState, Button } from "../components/common/UI";
import { PageBanner } from "../components/common/ReferenceUI";

export const checkoutSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .min(2, "Enter your full name")
    .max(80)
    .required("Name is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .max(254)
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .required("Phone is required"),
  address: Yup.string()
    .trim()
    .min(10, "Enter a complete street address")
    .max(250)
    .required("Address is required"),
  city: Yup.string()
    .trim()
    .min(2, "Enter a city")
    .max(80)
    .required("City is required"),
  state: Yup.string()
    .trim()
    .min(2, "Enter a state or union territory")
    .max(80)
    .required("State is required"),
  pin: Yup.string()
    .matches(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code")
    .required("PIN code is required"),
});

export default function Checkout() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getCartTotal());

  if (!items.length)
    return (
      <div className="container section-bottom">
        <EmptyState title="Your cart is empty">
          Add a product before reviewing checkout.
        </EmptyState>
      </div>
    );

  if (items.some((item) => !maxQuantity(item.product)))
    return (
      <div className="container empty-state section-bottom">
        <h1>An item is unavailable</h1>
        <Link className="button primary" to="/cart">Review your cart</Link>
      </div>
    );

  return (
    <div className="container reference-checkout-page section-bottom">
      <Breadcrumb items={[{ label: "Cart", to: "/cart" }, { label: "Checkout" }]} />
      <PageBanner
        eyebrow="CHECKOUT PREVIEW"
        title="Complete your details"
        subtitle="Order infrastructure is ready, but live order creation stays disabled until secure Razorpay payment is connected."
        compact
      />

      <ol className="reference-checkout-steps" aria-label="Checkout progress">
        <li className="complete">
          <span>1</span>
          <div><strong>Cart</strong><small>Reviewed</small></div>
        </li>
        <li className="current" aria-current="step">
          <span>2</span>
          <div><strong>Details</strong><small>Current step</small></div>
        </li>
        <li>
          <span>3</span>
          <div><strong>Payment</strong><small>Phase 8</small></div>
        </li>
      </ol>

      <p className="notice reference-checkout-notice">
        Preview only while payments are disabled. The backend can validate server prices, stock and order data, but this page does not create a live order until Razorpay checkout is enabled.
      </p>

      <div className="reference-checkout-layout">
        <Formik
          initialValues={{
            fullName: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            pin: "",
          }}
          validationSchema={checkoutSchema}
          onSubmit={(_values, { setStatus, setSubmitting }) => {
            setStatus(
              "The form is valid. Live order creation remains disabled until secure payment is connected.",
            );
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, status }) => (
            <Form className="reference-checkout-form" noValidate>
              <section className="reference-checkout-card">
                <div className="reference-checkout-card-heading">
                  <span><UserRound size={20} /></span>
                  <div>
                    <h2>Contact Information</h2>
                    <p>How we would identify and contact you.</p>
                  </div>
                </div>
                <FormField label="Full name" name="fullName" autoComplete="name" required maxLength={80} />
                <div className="form-grid">
                  <FormField label="Email address" name="email" type="email" autoComplete="email" required />
                  <FormField
                    label="Phone number"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    required
                  />
                </div>
              </section>

              <section className="reference-checkout-card">
                <div className="reference-checkout-card-heading">
                  <span><MapPin size={20} /></span>
                  <div>
                    <h2>Shipping Address</h2>
                    <p>Prepared for secure order processing.</p>
                  </div>
                </div>
                <FormField
                  label="Address line"
                  name="address"
                  autoComplete="street-address"
                  required
                  maxLength={250}
                />
                <div className="form-grid three">
                  <FormField label="City" name="city" autoComplete="address-level2" required />
                  <FormField label="State / union territory" name="state" autoComplete="address-level1" required />
                  <FormField
                    label="PIN code"
                    name="pin"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    required
                  />
                </div>
              </section>

              <section className="reference-checkout-card">
                <div className="reference-checkout-card-heading">
                  <span><CreditCard size={20} /></span>
                  <div>
                    <h2>Payment Method</h2>
                    <p>Razorpay will be connected in the payment phase.</p>
                  </div>
                </div>
                <div className="reference-payment-preview">
                  <ShieldCheck size={24} />
                  <div>
                    <strong>Online payments are not enabled</strong>
                    <p>
                      The Phase 6 backend already validates catalog prices and inventory. Payment and final order activation will be handled securely through Razorpay in Phase 8.
                    </p>
                  </div>
                </div>
                <Button className="full-width" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Checking…" : "Validate checkout details"}
                  <Check size={17} />
                </Button>
                {status && <p className="notice" role="status">{status}</p>}
              </section>
            </Form>
          )}
        </Formik>

        <aside className="reference-checkout-sidebar">
          <section className="reference-summary-card reference-checkout-summary">
            <div className="reference-summary-heading">
              <h2>Order Summary</h2>
              <Link to="/cart" className="reference-link">Edit Cart</Link>
            </div>
            <div className="reference-summary-products">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="reference-summary-product">
                  <ProductImage src={product.image} alt={product.name} />
                  <div>
                    <strong>{product.name}</strong>
                    <small>{product.subcategory || product.category} · Qty {quantity}</small>
                  </div>
                  <span>{money(product.price * quantity)}</span>
                </div>
              ))}
            </div>
            <dl>
              <div><dt>Subtotal</dt><dd>{money(total)}</dd></div>
              <div>
                <dt>Shipping</dt>
                <dd>{site.shippingFee === null ? "To be confirmed" : money(site.shippingFee)}</dd>
              </div>
              <div className="reference-summary-total">
                <dt>Estimated Total</dt>
                <dd>{money(total + (site.shippingFee ?? 0))}</dd>
              </div>
            </dl>
            <p className="muted small">
              Shipping and final charges must be confirmed before payment is enabled.
            </p>
          </section>

          <section className="reference-checkout-side-note">
            <ShieldCheck size={25} />
            <div>
              <h3>Designed for a safer checkout</h3>
              <p>Client-side prices are never authoritative for orders.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
