import { env, razorpayConfigured } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const API_BASE = "https://api.razorpay.com/v1";

type RazorpayOrder = {
  id: string;
  entity: "order";
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string | null;
  status: string;
  attempts: number;
};

type RazorpayPayment = {
  id: string;
  entity: "payment";
  amount: number;
  currency: string;
  status: string;
  order_id: string | null;
  captured: boolean;
  email?: string | null;
  contact?: string | null;
};

type RazorpayRefund = {
  id: string;
  entity: "refund";
  amount: number;
  currency: string;
  payment_id: string;
  status: string;
  created_at: number;
};

function credentials() {
  if (!razorpayConfigured || !env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new AppError(503, "RAZORPAY_NOT_CONFIGURED", "Razorpay payments are not configured.");
  }
  return { keyId: env.RAZORPAY_KEY_ID, keySecret: env.RAZORPAY_KEY_SECRET };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { keyId, keySecret } = credentials();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    signal: AbortSignal.timeout(12_000),
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  }).catch((error: unknown) => {
    throw new AppError(502, "RAZORPAY_UNAVAILABLE", "Razorpay could not be reached. Please try again.", {
      cause: error instanceof Error ? error.name : "network_error",
    });
  });

  const body = (await response.json().catch(() => null)) as
    | T
    | { error?: { code?: string; description?: string; reason?: string } }
    | null;

  if (!response.ok || !body) {
    const errorBody = body as { error?: { code?: string; description?: string; reason?: string } } | null;
    throw new AppError(
      502,
      "RAZORPAY_API_ERROR",
      errorBody?.error?.description || "Razorpay rejected the payment request.",
      { providerCode: errorBody?.error?.code, reason: errorBody?.error?.reason },
    );
  }

  return body as T;
}

export function getRazorpayPublicKey() {
  return credentials().keyId;
}

export function createRazorpayProviderOrder(input: {
  amountPaise: number;
  currency: string;
  receipt: string;
  localOrderId: string;
}) {
  return request<RazorpayOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: input.currency,
      receipt: input.receipt.slice(0, 40),
      notes: { joyneeds_order_id: input.localOrderId },
    }),
  });
}

export function fetchRazorpayPayment(providerPaymentId: string) {
  return request<RazorpayPayment>(`/payments/${encodeURIComponent(providerPaymentId)}`);
}

export function refundRazorpayPayment(input: {
  providerPaymentId: string;
  amountPaise: number;
  idempotencyKey: string;
  orderNumber: string;
  reason?: string;
}) {
  return request<RazorpayRefund>(`/payments/${encodeURIComponent(input.providerPaymentId)}/refund`, {
    method: "POST",
    headers: { "X-Refund-Idempotency": input.idempotencyKey },
    body: JSON.stringify({
      amount: input.amountPaise,
      notes: {
        joyneeds_order: input.orderNumber,
        ...(input.reason ? { reason: input.reason.slice(0, 200) } : {}),
      },
    }),
  });
}
