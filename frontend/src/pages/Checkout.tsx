import { useEffect, useState } from "react";
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
import { useCustomerAuth } from "../auth/CustomerAuthProvider";
import { createOrder, getCheckoutFeatures, quoteOrder, type OrderQuote, type CheckoutFeatures } from "../api/orders";
import {
  loadRazorpayCheckout,
  openRazorpayCheckout,
  prepareRazorpayOrder,
  verifyRazorpayCheckout,
} from "../api/payments";
import { useCartStore } from "../store/cartStore";
import { preparePaytmOrder, openPaytmCheckout } from "../api/paytm";
import { useCatalogStore } from "../store/catalogStore";
import { money, maxQuantity } from "../utils/catalog";
import { site } from "../config/site";
import FormField from "../components/common/FormField";
import ProductImage from "../components/common/ProductImage";
import { Breadcrumb, EmptyState, Button } from "../components/common/UI";
import { PageBanner } from "../components/common/ReferenceUI";

export const checkoutSchema = Yup.object({
  fullName: Yup.string().trim().min(2, "Enter your full name").max(80).required("Name is required"),
  email: Yup.string().trim().email("Enter a valid email").max(254).required("Email is required"),
  phone: Yup.string().matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number").required("Phone is required"),
  address: Yup.string().trim().min(10, "Enter a complete street address").max(250).required("Address is required"),
  city: Yup.string().trim().min(2, "Enter a city").max(80).required("City is required"),
  state: Yup.string().trim().min(2, "Enter a state or union territory").max(80).required("State is required"),
  pin: Yup.string().matches(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code").required("PIN code is required"),
});

export default function Checkout() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getCartTotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const auth = useCustomerAuth();
  const catalogStatus = useCatalogStore((state) => state.status);
  const [features, setFeatures] = useState<CheckoutFeatures | null>(null);
  const [featureError, setFeatureError] = useState("");
  const [couponDraft,setCouponDraft]=useState("");
  const [couponBusy,setCouponBusy]=useState(false);
  const [couponError,setCouponError]=useState("");
  const [applied,setApplied]=useState<{quote:OrderQuote;cartKey:string}|null>(null);
  const cartKey=JSON.stringify(items.map(({product,quantity})=>[product.id,quantity,product.price]));
  const activeQuote=applied?.cartKey===cartKey?applied.quote:null;
  const applyCoupon=async()=>{const code=couponDraft.trim().toUpperCase();if(!/^[A-Z0-9][A-Z0-9_-]{2,29}$/.test(code)){setCouponError("Enter a valid coupon code.");return;}setCouponBusy(true);setCouponError("");setApplied(null);try{const quote=await quoteOrder(items.map(({product,quantity})=>({productId:product.id,quantity})),code);setApplied({quote,cartKey});}catch(error){setCouponError(error instanceof Error?error.message:"Unable to apply coupon.");}finally{setCouponBusy(false);}};
  useEffect(() => {
    if (!site.checkoutEnabled) return;
    let active = true;
    void getCheckoutFeatures().then(value => { if (active) { setFeatures(value); setFeatureError(""); } })
      .catch(() => { if (active) setFeatureError("Secure checkout is temporarily unavailable. Please reload to try again."); });
    return () => { active = false; };
  }, []);
  const canCheckout = site.checkoutEnabled && catalogStatus === "ready" && features?.checkoutEnabled === true;
  const shippingFee = activeQuote ? activeQuote.shippingPaise / 100 : features ? features.shippingFeePaise / 100 : site.shippingFee;
  const shownSubtotal=activeQuote?activeQuote.subtotalPaise/100:total;
  const shownTotal=activeQuote?activeQuote.totalPaise/100:total+(shippingFee??0);
  const paytmMode = (features?.paymentProvider ?? import.meta.env.VITE_PAYMENT_PROVIDER) !== "RAZORPAY";
  const [paytmOrderNumber, setPaytmOrderNumber] = useState<string | null>(null);
  const [completed, setCompleted] = useState<{ orderNumber: string; fulfillmentReady: boolean } | null>(null);

  if (completed) {
    return (
      <div className="container section-bottom">
        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Order confirmed" }]} />
        <PageBanner theme="confirmation" eyebrow="PAYMENT VERIFIED" title="Thank you for your order" subtitle={`Order ${completed.orderNumber} has a verified Razorpay payment.`} compact />
        <section className="reference-checkout-card">
          <div className="reference-checkout-card-heading">
            <span><Check size={22} /></span>
            <div>
              <h2>{completed.fulfillmentReady ? "Order confirmed" : "Payment received"}</h2>
              <p>
                {completed.fulfillmentReady
                  ? "Payment was verified server-side and the order is confirmed."
                  : "Payment was verified, but the order requires a stock review before fulfillment. We will not pretend it is ready until that check succeeds."}
              </p>
            </div>
          </div>
          <div className="admin-form-actions">
            {auth.isSignedIn && <Link className="button primary" to="/account">View account</Link>}
            <Link className="button secondary" to="/shop">Continue shopping</Link>
          </div>
        </section>
      </div>
    );
  }

  if (!items.length)
    return (
      <div className="container section-bottom">
        <EmptyState title="Your cart is empty">Add a product before reviewing checkout.</EmptyState>
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
        theme="checkout"
        eyebrow="SECURE CHECKOUT"
        title="Complete your details"
        subtitle="Your payment amount is calculated by the server and verified before order confirmation."
        compact
      />

      <ol className="reference-checkout-steps" aria-label="Checkout progress">
        <li className="complete"><span>1</span><div><strong>Cart</strong><small>Reviewed</small></div></li>
        <li className="current" aria-current="step"><span>2</span><div><strong>Details</strong><small>Current step</small></div></li>
        <li><span>3</span><div><strong>Payment</strong><small>{paytmMode ? "UPI / Paytm" : "Razorpay"}</small></div></li>
      </ol>

      <p className="notice reference-checkout-notice">
        Payment is enabled only after the merchant has configured secure payment verification and activated order creation. Client-side prices never determine the amount charged.
      </p>

      {featureError && <p role="alert" className="notice">{featureError}</p>}
      <div className="reference-checkout-layout">
        <Formik
          initialValues={{ fullName: "", email: auth.user?.email ?? "", phone: "", address: "", city: "", state: "", pin: "" }}
          validationSchema={checkoutSchema}
          enableReinitialize={false}
          onSubmit={async (values, { setStatus, setSubmitting }) => {
            setStatus(undefined);
            if (couponBusy) { setStatus("Please wait for coupon validation."); setSubmitting(false); return; }
            if (!canCheckout) { setStatus("Online payments are not available yet."); setSubmitting(false); return; }
            try {
              const token = auth.isSignedIn ? await auth.getToken() : null;
              const order = await createOrder(
                {
                  customerName: values.fullName.trim(),
                  customerEmail: values.email.trim(),
                  customerPhone: values.phone,
                  addressLine1: values.address.trim(),
                  city: values.city.trim(),
                  state: values.state.trim(),
                  postalCode: values.pin,
                  ...(activeQuote?.couponCode?{couponCode:activeQuote.couponCode}:{}),
                  expectedTotalPaise:Math.round(shownTotal*100),
                  items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
                },
                token,
              );
              if (!order.paymentReady) throw new Error("The payment provider is not ready for this order.");
              if (order.totalPaise !== Math.round(shownTotal * 100)) throw new Error("Your total changed. Reload your cart and review the current prices before paying.");
              if (order.paymentProvider !== features?.paymentProvider) throw new Error("Payment settings changed. Reload checkout before trying again.");
              if (order.paymentProvider === "PAYTM") {
                const paytm = await preparePaytmOrder(order.id, token);
                setPaytmOrderNumber(paytm.orderNumber);
                await openPaytmCheckout(paytm);
                setStatus("Paytm checkout opened. Confirm your payment status before your order is processed.");
                return;
              }

              const prepared = await prepareRazorpayOrder(order.id, token);
              await loadRazorpayCheckout();

              await new Promise<void>((resolve, reject) => {
                openRazorpayCheckout(
                  prepared,
                  { name: values.fullName.trim(), email: values.email.trim(), phone: values.phone },
                  async (response) => {
                    try {
                      const verification = await verifyRazorpayCheckout({
                        paymentId: prepared.paymentId,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpayOrderId: response.razorpay_order_id,
                        razorpaySignature: response.razorpay_signature,
                      });
                      if (verification.paid) {
                        clearCart();
                        setCompleted({ orderNumber: prepared.orderNumber, fulfillmentReady: verification.fulfillmentReady });
                      } else {
                        setStatus("Payment signature was verified, but Razorpay has not captured the payment yet. The order will not be treated as paid until capture is confirmed.");
                      }
                      resolve();
                    } catch (error) {
                      reject(error);
                    }
                  },
                  (message) => reject(new Error(message)),
                  () => {
                    setStatus("Payment window closed. Your order remains pending and is not treated as paid.");
                    resolve();
                  },
                );
              });
            } catch (error) {
              setStatus(error instanceof Error ? error.message : "Unable to start secure payment. Please try again.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, status }) => (
            <Form className="reference-checkout-form" noValidate>
              <section className="reference-checkout-card">
                <div className="reference-checkout-card-heading">
                  <span><UserRound size={20} /></span>
                  <div><h2>Contact Information</h2><p>Used for this order and payment receipt workflow.</p></div>
                </div>
                <FormField label="Full name" name="fullName" autoComplete="name" required maxLength={80} />
                <div className="form-grid">
                  <FormField label="Email address" name="email" type="email" autoComplete="email" required />
                  <FormField label="Phone number" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} required />
                </div>
              </section>

              <section className="reference-checkout-card">
                <div className="reference-checkout-card-heading">
                  <span><MapPin size={20} /></span>
                  <div><h2>Shipping Address</h2><p>Validated by the backend before the payment order is prepared.</p></div>
                </div>
                <FormField label="Address line" name="address" autoComplete="street-address" required maxLength={250} />
                <div className="form-grid three">
                  <FormField label="City" name="city" autoComplete="address-level2" required />
                  <FormField label="State / union territory" name="state" autoComplete="address-level1" required />
                  <FormField label="PIN code" name="pin" inputMode="numeric" autoComplete="postal-code" maxLength={6} required />
                </div>
              </section>

              <section className="reference-checkout-card">
                <div className="reference-checkout-card-heading">
                  <span><CreditCard size={20} /></span>
                  <div><h2>Payment Method</h2><p>{paytmMode ? "UPI and other methods enabled by the merchant through Paytm." : "Secure online payment through Razorpay Checkout."}</p></div>
                </div>
                <div className="reference-payment-preview">
                  <ShieldCheck size={24} />
                  <div>
                    <strong>{paytmMode ? "Paytm secure checkout" : "Razorpay secure checkout"}</strong>
                    <p>The backend calculates the payment amount and verifies the provider transaction before confirming your order.</p>
                  </div>
                </div>
                <Button className="full-width" type="submit" disabled={isSubmitting || couponBusy || !canCheckout}>
                  {!canCheckout ? "Online payments not available" : isSubmitting ? "Preparing secure payment…" : "Pay securely"}
                  <CreditCard size={17} />
                </Button>
                {status && <p className="notice" role="status">{status}</p>}
                {paytmOrderNumber && <Link className="button secondary full-width" to={`/payment-status?order=${encodeURIComponent(paytmOrderNumber)}`}>Check payment status</Link>}
              </section>
            </Form>
          )}
        </Formik>

        <aside className="reference-checkout-sidebar">
          <section className="reference-summary-card reference-checkout-summary">
            <div className="reference-summary-heading"><h2>Order Summary</h2><Link to="/cart" className="reference-link">Edit Cart</Link></div>
            <div className="reference-summary-products">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="reference-summary-product">
                  <ProductImage src={product.image} alt={product.name} />
                  <div><strong>{product.name}</strong><small>{product.subcategory || product.category} · Qty {quantity}</small></div>
                  <span>{money(product.price * quantity)}</span>
                </div>
              ))}
            </div>
            <dl>
              <div><dt>Subtotal</dt><dd>{money(shownSubtotal)}</dd></div>
              <div><dt>Shipping</dt><dd>{shippingFee === null ? "Calculated by server" : money(shippingFee)}</dd></div>
              {activeQuote && <div><dt>Coupon discount</dt><dd>− {money(activeQuote.discountPaise/100)}</dd></div>}
              <div className="reference-summary-total"><dt>Estimated Total</dt><dd>{money(shownTotal)}</dd></div>
            </dl>
            {features?.couponsEnabled && <div className="jn-coupon-box"><label htmlFor="checkout-coupon">Have a coupon?</label><div className="jn-coupon-row"><input id="checkout-coupon" maxLength={30} value={couponDraft} onChange={event=>setCouponDraft(event.target.value.toUpperCase())} placeholder="Coupon code" disabled={couponBusy}/><button type="button" className="button secondary" disabled={couponBusy} onClick={()=>void applyCoupon()}>{couponBusy?"Checking…":"Apply"}</button></div>{activeQuote && <p className="jn-coupon-applied" role="status">{activeQuote.couponCode} applied. <button type="button" onClick={()=>{setApplied(null);setCouponDraft("");setCouponError("");}}>Remove</button></p>}{couponError && <p className="field-error" role="alert">{couponError}</p>}{applied&&!activeQuote&&<p role="status">Your cart changed. Apply the coupon again.</p>}</div>}
            <p className="muted small">The payment amount comes from the validated backend order record.</p>
          </section>

          <section className="reference-checkout-side-note">
            <ShieldCheck size={25} />
            <div><h3>Server-verified payment</h3><p>Signature, captured amount, order ID and webhook events are reconciled before fulfillment.</p></div>
          </section>
        </aside>
      </div>
    </div>
  );
}
