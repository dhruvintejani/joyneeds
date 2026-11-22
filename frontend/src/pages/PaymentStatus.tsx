import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock3, ShieldCheck, XCircle } from "lucide-react";
import { confirmPaytmOrder, type PaytmStatus } from "../api/paytm";
import { useCartStore } from "../store/cartStore";
export default function PaymentStatus() {
  const [query] = useSearchParams();
  const order = query.get("order") || "";
  const [status, setStatus] = useState<PaytmStatus | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const clearCart = useCartStore((state) => state.clearCart);
  const check = async () => {
    if (!/^JN-[0-9]{8}-[A-F0-9]{8}$/.test(order)) { setError("Payment reference not found."); return; }
    setPending(true); setError("");
    try {
      const result = await confirmPaytmOrder(order);
      setStatus(result);
      if (result.paid) clearCart();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not verify the payment."); }
    finally { setPending(false); }
  };
  useEffect(() => { void check(); }, [order]);
  const paid = status?.paid;
  return (
    <div className="container section-bottom" style={{ maxWidth: 700, paddingBlock: 72 }}>
      <div className="reference-checkout-card" style={{ padding: 32, textAlign: "center" }}>
        {paid ? <CheckCircle2 size={44} color="#276f56" /> : status?.pending || pending ? <Clock3 size={44} /> : <XCircle size={44} />}
        <h1>{paid ? "Payment verified" : status?.pending || pending ? "Checking payment" : "Payment not confirmed"}</h1>
        <p>{paid ? status?.fulfillmentReady ? "Your payment has been verified and your order is confirmed." : "Payment received. Your order requires stock review before fulfillment." : "Only a verified payment can confirm an order. If you paid, use Check again."}</p>
        {order && <p>Reference: <strong>{order}</strong></p>}
        {error && <p role="alert">{error}</p>}
        {!paid && <button type="button" className="button primary" onClick={() => void check()} disabled={pending}>{pending ? "Checking…" : "Check payment status"}</button>}
        <div style={{ marginTop: 22 }}><Link className="button secondary" to="/shop">Return to shop</Link></div>
      </div>
      <p style={{ textAlign: "center", marginTop: 16 }}><ShieldCheck size={16} style={{ verticalAlign: "middle" }} /> Payment status is verified directly with the provider.</p>
    </div>
  );
}
