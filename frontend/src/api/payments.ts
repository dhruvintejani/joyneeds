import { apiBaseUrl, CatalogApiError } from "./catalog";

export type RazorpayPreparedOrder = {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  keyId: string;
  amountPaise: number;
  currency: string;
};

export type RazorpayVerification = {
  verified: boolean;
  paid: boolean;
  orderId: string;
  fulfillmentReady: boolean;
};

async function request<T>(path: string, init?: RequestInit, token?: string | null): Promise<T> {
  if (!apiBaseUrl) throw new CatalogApiError("The payment API is not configured for this deployment.");
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json().catch(() => null)) as
    | { data?: T; error?: { code?: string; message?: string } }
    | null;
  if (!response.ok || !body?.data) {
    const error = new CatalogApiError(
      body?.error?.message || "The payment service returned an unexpected response.",
      response.status,
    );
    (error as CatalogApiError & { code?: string }).code = body?.error?.code;
    throw error;
  }
  return body.data;
}

export const prepareRazorpayOrder = (orderId: string, token?: string | null) =>
  request<RazorpayPreparedOrder>(
    "/api/payments/razorpay/order",
    { method: "POST", body: JSON.stringify({ orderId }) },
    token,
  );

export const verifyRazorpayCheckout = (input: {
  paymentId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}) =>
  request<RazorpayVerification>(
    "/api/payments/razorpay/verify",
    { method: "POST", body: JSON.stringify(input) },
  );

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailure = {
  error?: {
    code?: string;
    description?: string;
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccess) => void | Promise<void>;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailure) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let checkoutLoader: Promise<void> | null = null;

export function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (checkoutLoader) return checkoutLoader;
  checkoutLoader = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => (window.Razorpay ? resolve() : reject(new Error("Razorpay Checkout did not load.")));
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout."));
    document.head.appendChild(script);
  }).catch((error) => {
    checkoutLoader = null;
    throw error;
  });
  return checkoutLoader;
}

export function openRazorpayCheckout(
  prepared: RazorpayPreparedOrder,
  customer: { name: string; email: string; phone: string },
  onSuccess: (response: RazorpaySuccess) => void | Promise<void>,
  onFailure: (message: string) => void,
  onDismiss: () => void,
) {
  if (!window.Razorpay) throw new Error("Razorpay Checkout is not loaded.");
  const instance = new window.Razorpay({
    key: prepared.keyId,
    amount: prepared.amountPaise,
    currency: prepared.currency,
    name: "JoyNeeds",
    description: `Order ${prepared.orderNumber}`,
    order_id: prepared.razorpayOrderId,
    handler: onSuccess,
    prefill: { name: customer.name, email: customer.email, contact: customer.phone },
    theme: { color: "#1e2a39" },
    modal: { ondismiss: onDismiss },
  });
  instance.on("payment.failed", (response) => {
    onFailure(response.error?.description || "Payment failed. No order was confirmed.");
  });
  instance.open();
}
