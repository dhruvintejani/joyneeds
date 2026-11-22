import { apiBaseUrl, CatalogApiError } from "./catalog";
export type PreparedPaytm = { mid: string; orderNumber: string; amount: string; txnToken: string; host: string };
export type PaytmStatus = { orderNumber: string; paid: boolean; pending: boolean; fulfillmentReady: boolean };
async function api<T>(endpoint: string, body: object, token?: string | null): Promise<T> {
  if (!apiBaseUrl) throw new CatalogApiError("Checkout backend is not configured.");
  const response = await fetch(apiBaseUrl + endpoint, {
    method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const value = await response.json().catch(() => null) as { data?: T; error?: { message?: string } } | null;
  if (!response.ok || !value?.data) throw new CatalogApiError(value?.error?.message || "Payment service unavailable.", response.status);
  return value.data;
}
export const preparePaytmOrder = (orderId: string, token?: string | null) =>
  api<PreparedPaytm>("/api/payments/paytm/order", { orderId }, token);
export const confirmPaytmOrder = (orderNumber: string) =>
  api<PaytmStatus>("/api/payments/paytm/status", { orderNumber });

type CheckoutJS = {
  onLoad: (callback: () => void) => void;
  init: (value: object) => Promise<unknown>;
  invoke: () => void;
};
declare global { interface Window { Paytm?: { CheckoutJS?: CheckoutJS } } }
export async function openPaytmCheckout(payment: PreparedPaytm): Promise<void> {
  if (!/^https:\/\/secure(?:stage)?\.paytmpayments\.com$/.test(payment.host) || !/^[a-zA-Z0-9]+$/.test(payment.mid)) {
    throw new Error("Unrecognized payment gateway configuration.");
  }
  if (!window.Paytm?.CheckoutJS) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${payment.host}/merchantpgpui/checkoutjs/merchants/${encodeURIComponent(payment.mid)}.js`;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Unable to load secure checkout."));
      document.head.appendChild(script);
    });
  }
  const checkout = window.Paytm?.CheckoutJS;
  if (!checkout) throw new Error("Secure checkout is unavailable.");
  await new Promise<void>((resolve) => checkout.onLoad(resolve));
  await checkout.init({
    root: "", flow: "DEFAULT",
    data: { orderId: payment.orderNumber, token: payment.txnToken, tokenType: "TXN_TOKEN", amount: payment.amount },
    handler: { notifyMerchant: () => { /* Never treat frontend events as proof of payment. */ } },
  });
  checkout.invoke();
}
