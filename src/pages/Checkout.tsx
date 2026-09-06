import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { Check, CreditCard, MapPin, UserRound } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { money, maxQuantity } from "../utils/catalog";
import { site } from "../config/site";
import FormField from "../components/common/FormField";
import ProductImage from "../components/common/ProductImage";
import {
  Breadcrumb,
  PageHeading,
  EmptyState,
  Button,
} from "../components/common/UI";

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
  const items = useCartStore((s) => s.items),
    total = useCartStore((s) => s.getCartTotal());
  if (!items.length)
    return (
      <div className="container">
        <EmptyState title="Your bag is empty">
          Add a product before reviewing checkout.
        </EmptyState>
      </div>
    );
  if (items.some((i) => !maxQuantity(i.product)))
    return (
      <div className="container empty-state">
        <h1>An item is unavailable</h1>
        <Link className="button primary" to="/cart">
          Review your bag
        </Link>
      </div>
    );
  return (
    <div className="container section-bottom">
      <Breadcrumb
        items={[{ label: "Cart", to: "/cart" }, { label: "Checkout" }]}
      />
      <PageHeading title="Review your checkout">
        Guest checkout · No account needed
      </PageHeading>
      <ol className="checkout-steps" aria-label="Checkout progress">
        <li className="complete">
          <span className="step-icon"><Check size={15} /></span>
          <div><strong>Bag</strong><small>Reviewed</small></div>
        </li>
        <li className="current" aria-current="step">
          <span className="step-icon"><UserRound size={15} /></span>
          <div><strong>Details</strong><small>Current step</small></div>
        </li>
        <li>
          <span className="step-icon"><CreditCard size={15} /></span>
          <div><strong>Payment</strong><small>Not enabled</small></div>
        </li>
      </ol>
      <p className="notice">
        Checkout preview only. Do not enter real personal details for testing.
        No order is created, no payment is collected, and these fields are not
        saved.
      </p>
      <div className="cart-layout checkout-layout">
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
              "The form is valid. Orders and payments are not enabled; no order was placed and no details were sent.",
            );
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, status }) => (
            <Form className="checkout-form" noValidate>
              <div className="checkout-section-heading">
                <span><UserRound size={18} /></span>
                <div><h2>Contact details</h2><p>How we would identify and contact you.</p></div>
              </div>
              <FormField
                label="Full name"
                name="fullName"
                autoComplete="name"
                required
                maxLength={80}
              />
              <div className="form-grid">
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
                <FormField
                  label="Mobile number"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={10}
                  required
                />
              </div>
              <div className="checkout-section-heading">
                <span><MapPin size={18} /></span>
                <div><h2>Shipping address</h2><p>Used only when order processing is implemented.</p></div>
              </div>
              <FormField
                label="Street address"
                name="address"
                autoComplete="street-address"
                required
                maxLength={250}
              />
              <div className="form-grid">
                <FormField
                  label="City"
                  name="city"
                  autoComplete="address-level2"
                  required
                />
                <FormField
                  label="State / union territory"
                  name="state"
                  autoComplete="address-level1"
                  required
                />
              </div>
              <FormField
                label="PIN code"
                name="pin"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
                required
              />
              <div className="checkout-section-heading">
                <span><CreditCard size={18} /></span>
                <div><h2>Payment</h2><p>Prepared for a future secure payment flow.</p></div>
              </div>
              <div className="payment-placeholder">
                <strong>Online payments are not enabled</strong>
                <p>
                  Razorpay can be connected later through a secure backend. No
                  card or banking details are requested here.
                </p>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Checking…" : "Validate checkout details"}
              </Button>
              {status && (
                <p className="notice" role="status">
                  {status}
                </p>
              )}
            </Form>
          )}
        </Formik>
        <aside className="order-summary">
          <h2>In your bag</h2>
          {items.map(({ product: p, quantity }) => (
            <div key={p.id} className="summary-product">
              <ProductImage src={p.image} alt={p.name} />
              <div>
                <strong>{p.name}</strong>
                <p className="muted small">Qty {quantity}</p>
              </div>
              <span>{money(p.price * quantity)}</span>
            </div>
          ))}
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{money(total)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>
                {site.shippingFee === null
                  ? "To be confirmed"
                  : money(site.shippingFee)}
              </dd>
            </div>
            <div className="summary-total">
              <dt>Estimated total</dt>
              <dd>{money(total + (site.shippingFee ?? 0))}</dd>
            </div>
          </dl>
          <p className="muted small">
            Shipping and final charges must be confirmed before payment is
            enabled.
          </p>
          <Link className="text-link" to="/cart">
            Edit your bag
          </Link>
        </aside>
      </div>
    </div>
  );
}
