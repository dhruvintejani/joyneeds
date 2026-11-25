import { env, orderCreationEnabled, paytmConfigured } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
import { notifyOrderStatusSafely } from "./emailService.js";
import { commitInventoryAndConfirm } from "./paymentService.js";
import { fetchPaytmTransaction, initiatePaytmTransaction, paymentMatchesOrder } from "./paytmClient.js";

function ensureEnabled(forNewOrder = true) {
  // Disabling new payments must not prevent reconciliation of an existing Paytm transaction.
  if (!paytmConfigured || (forNewOrder && (env.PAYMENT_PROVIDER !== "PAYTM" || !orderCreationEnabled))) {
    throw new AppError(503, "PAYTM_DISABLED", "Paytm payments are not enabled for this store.");
  }
}
export async function createPaytmCheckout(orderId: string, clerkUserId: string | null) {
  ensureEnabled();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, orderNumber: true, totalPaise: true, currency: true, status: true, user: { select: { clerkUserId: true } } },
  });
  if (!order) throw new AppError(404, "ORDER_NOT_FOUND", "Order not found.");
  if (order.user && order.user.clerkUserId !== clerkUserId) throw new AppError(403, "ORDER_ACCESS_DENIED", "Order belongs to another account.");
  if (order.status !== "PENDING" || order.currency !== "INR" || order.totalPaise <= 0) {
    throw new AppError(409, "ORDER_NOT_PAYABLE", "This order cannot start a payment.");
  }
  const paid = await prisma.payment.findFirst({
    where: { orderId, status: { in: ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"] } },
    select: { id: true },
  });
  if (paid) throw new AppError(409, "ORDER_ALREADY_PAID", "This order is already paid.");
  const otherPayment = await prisma.payment.findFirst({ where: { orderId, provider: { not: "PAYTM" }, status: { not: "FAILED" } }, select: { id: true } });
  if (otherPayment) throw new AppError(409, "PAYMENT_PROVIDER_CONFLICT", "An existing payment must be resolved before using a different provider.");
  const existing = await prisma.payment.findUnique({ where: { providerOrderId: order.orderNumber } });
  if (existing && (existing.provider !== "PAYTM" || existing.orderId !== order.id || existing.amountPaise !== order.totalPaise)) {
    throw new AppError(409, "PAYMENT_ORDER_MISMATCH", "Payment record does not match the order.");
  }
  if (existing) {
    // Reconcile first so a repeated checkout cannot charge an already paid order.
    const latest = await reconcilePaytmStatus(order.orderNumber);
    if (latest.paid) throw new AppError(409, "ORDER_ALREADY_PAID", "This order is already paid.");
    if (latest.pending) throw new AppError(409, "PAYTM_PENDING", "Your previous payment is still pending. Check its status before trying again.");
  }
  await prisma.payment.upsert({
    where: { providerOrderId: order.orderNumber },
    create: { orderId: order.id, provider: "PAYTM", providerOrderId: order.orderNumber, amountPaise: order.totalPaise, currency: "INR", status: "PENDING" },
    update: { status: "PENDING" },
  });
  return initiatePaytmTransaction({ orderId: order.orderNumber, amountPaise: order.totalPaise, customerId: order.id });
}
export async function reconcilePaytmStatus(orderNumber: string) {
  ensureEnabled(false);
  const payment = await prisma.payment.findUnique({
    where: { providerOrderId: orderNumber },
    select: { id: true, orderId: true, provider: true, providerOrderId: true, amountPaise: true, currency: true, status: true },
  });
  if (!payment || payment.provider !== "PAYTM" || !payment.providerOrderId) {
    throw new AppError(404, "PAYTM_PAYMENT_NOT_FOUND", "Paytm order not found.");
  }
  const status = await fetchPaytmTransaction(payment.providerOrderId);
  if (status.resultInfo?.resultStatus === "TXN_SUCCESS") {
    if (!paymentMatchesOrder(status, { mid: env.PAYTM_MID!, orderId: payment.providerOrderId, amountPaise: payment.amountPaise }) || payment.currency !== "INR") {
      throw new AppError(409, "PAYTM_PAYMENT_MISMATCH", "The verified Paytm transaction does not match the order.");
    }
    await prisma.payment.updateMany({
      where: { id: payment.id, status: { notIn: ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"] } },
      data: { status: "PAID", providerPaymentId: status.txnId!, verifiedAt: new Date() },
    });
    let fulfillmentReady = false;
    try {
      fulfillmentReady = await commitInventoryAndConfirm(payment.orderId);
    } catch (error) {
      logger.error("Paytm payment received; inventory requires manual review", {
        orderId: payment.orderId, error: error instanceof Error ? error.message : "unknown",
      });
    }
    if (fulfillmentReady) await notifyOrderStatusSafely(payment.orderId, "CONFIRMED");
    return { paid: true, pending: false, fulfillmentReady, orderNumber };
  }
  if (status.resultInfo?.resultStatus === "TXN_FAILURE" && status.mid === env.PAYTM_MID && status.orderId === payment.providerOrderId) {
    await prisma.payment.updateMany({
      where: { id: payment.id, status: { notIn: ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"] } },
      data: { status: "FAILED", verifiedAt: new Date() },
    });
    return { paid: false, pending: false, fulfillmentReady: false, orderNumber };
  }
  return { paid: false, pending: status.resultInfo?.resultStatus !== "NO_RECORD_FOUND", fulfillmentReady: false, orderNumber };
}
