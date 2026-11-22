import PaytmChecksum from "paytmchecksum";
import { env, paytmConfigured } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export type PaytmTransaction = {
  resultInfo?: { resultStatus?: string; resultCode?: string; resultMsg?: string };
  txnId?: string; orderId?: string; mid?: string; txnAmount?: string; currency?: string;
};
type PaytmEnvelope<T> = { head?: { signature?: string }; body?: T };
const stageHost = "https://securestage.paytmpayments.com";
const productionHost = "https://secure.paytmpayments.com";

function setup() {
  if (!paytmConfigured || !env.PAYTM_MID || !env.PAYTM_MERCHANT_KEY || !env.PAYTM_WEBSITE_NAME || !env.PAYTM_CALLBACK_URL) {
    throw new AppError(503, "PAYTM_NOT_CONFIGURED", "Paytm payment processing is not configured.");
  }
  return { mid: env.PAYTM_MID, key: env.PAYTM_MERCHANT_KEY, websiteName: env.PAYTM_WEBSITE_NAME, callbackUrl: env.PAYTM_CALLBACK_URL };
}

export function checkoutHost() {
  return env.PAYTM_ENV === "production" ? productionHost : stageHost;
}
export function parsePaytmAmount(value: unknown): number | null {
  if (typeof value !== "string" || !/^(0|[1-9]\d{0,8})(?:\.(\d{1,2}))?$/.test(value)) return null;
  const [rupees, paise = ""] = value.split(".");
  const total = Number(rupees) * 100 + Number(paise.padEnd(2, "0"));
  return Number.isSafeInteger(total) ? total : null;
}
export function paymentMatchesOrder(txn: PaytmTransaction, expected: { mid: string; orderId: string; amountPaise: number }): boolean {
  return txn.resultInfo?.resultStatus === "TXN_SUCCESS" &&
    txn.mid === expected.mid && txn.orderId === expected.orderId &&
    parsePaytmAmount(txn.txnAmount) === expected.amountPaise &&
    Boolean(txn.txnId && txn.txnId.trim());
}

async function signedRequest<T>(path: string, body: object): Promise<T> {
  const { key } = setup();
  const encoded = JSON.stringify(body);
  const signature = await PaytmChecksum.generateSignature(encoded, key);
  const response = await fetch(checkoutHost() + path, {
    method: "POST", signal: AbortSignal.timeout(15000),
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ body, head: { signature } }),
  }).catch(() => { throw new AppError(502, "PAYTM_UNAVAILABLE", "Paytm is temporarily unavailable."); });
  if (!response.ok) throw new AppError(502, "PAYTM_HTTP_ERROR", "Paytm could not process the request.");
  const envelope = await response.json().catch(() => null) as PaytmEnvelope<T> | null;
  if (!envelope?.body || !envelope.head?.signature ||
      !PaytmChecksum.verifySignature(JSON.stringify(envelope.body), key, envelope.head.signature)) {
    throw new AppError(502, "PAYTM_RESPONSE_INVALID", "Payment provider signature verification failed.");
  }
  return envelope.body;
}
export async function initiatePaytmTransaction(input: { orderId: string; amountPaise: number; customerId: string }) {
  const config = setup();
  const body = {
    requestType: "Payment", mid: config.mid, websiteName: config.websiteName,
    orderId: input.orderId,
    txnAmount: { value: (input.amountPaise / 100).toFixed(2), currency: "INR" },
    userInfo: { custId: input.customerId },
    callbackUrl: config.callbackUrl,
  };
  const transaction = await signedRequest<{
    resultInfo?: { resultStatus?: string; resultMsg?: string };
    txnToken?: string;
  }>(`/theia/api/v1/initiateTransaction?mid=${encodeURIComponent(config.mid)}&orderId=${encodeURIComponent(input.orderId)}`, body);
  if (transaction.resultInfo?.resultStatus !== "S" || !transaction.txnToken) {
    throw new AppError(502, "PAYTM_INIT_FAILED", "Paytm did not return a valid transaction token.");
  }
  return { mid: config.mid, orderNumber: input.orderId, amount: body.txnAmount.value, txnToken: transaction.txnToken, host: checkoutHost() };
}
export async function fetchPaytmTransaction(orderId: string): Promise<PaytmTransaction> {
  const { mid } = setup();
  const status = await signedRequest<PaytmTransaction>("/v3/order/status", { mid, orderId });
  return status;
}
