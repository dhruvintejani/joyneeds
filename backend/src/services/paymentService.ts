import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { Prisma } from "../generated/prisma/client.js";
import { env, razorpayConfigured } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
import type {
  AdminRefundBody,
  CreateRazorpayOrderBody,
  VerifyRazorpayPaymentBody,
} from "../validators/paymentValidators.js";
import {
  createRazorpayProviderOrder,
  fetchRazorpayPayment,
  getRazorpayPublicKey,
  refundRazorpayPayment,
} from "./razorpayClient.js";

function ensureRazorpay() {
  if (!razorpayConfigured || !env.RAZORPAY_KEY_SECRET || !env.RAZORPAY_WEBHOOK_SECRET) {
    throw new AppError(503, "RAZORPAY_NOT_CONFIGURED", "Razorpay payments are not configured.");
  }
  return {
    keySecret: env.RAZORPAY_KEY_SECRET,
    webhookSecret: env.RAZORPAY_WEBHOOK_SECRET,
  };
}

function safeHexEqual(expectedHex: string, suppliedHex: string) {
  if (!/^[a-f0-9]{64}$/i.test(suppliedHex)) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const supplied = Buffer.from(suppliedHex, "hex");
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

function hashPayload(payload: Buffer) {
  return createHash("sha256").update(payload).digest("hex");
}

async function assertOrderAccess(orderId: string, clerkUserId: string | null) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      totalPaise: true,
      currency: true,
      status: true,
      user: { select: { clerkUserId: true } },
    },
  });
  if (!order) throw new AppError(404, "ORDER_NOT_FOUND", "Order not found.");
  if (order.user && order.user.clerkUserId !== clerkUserId) {
    throw new AppError(403, "ORDER_ACCESS_DENIED", "This order belongs to another customer account.");
  }
  return order;
}

export async function createRazorpayOrder(body: CreateRazorpayOrderBody, clerkUserId: string | null) {
  ensureRazorpay();
  const order = await assertOrderAccess(body.orderId, clerkUserId);
  if (order.status !== "PENDING") {
    throw new AppError(409, "ORDER_NOT_PAYABLE", "Only pending orders can start payment.");
  }
  if (order.totalPaise <= 0 || order.currency !== "INR") {
    throw new AppError(409, "ORDER_PAYMENT_INVALID", "This order cannot be paid through Razorpay.");
  }

  const existing = await prisma.payment.findFirst({
    where: { orderId: order.id, provider: "RAZORPAY", providerOrderId: { not: null } },
    orderBy: { createdAt: "desc" },
  });
  if (existing?.providerOrderId) {
    if (existing.amountPaise !== order.totalPaise || existing.currency !== order.currency) {
      throw new AppError(409, "PAYMENT_AMOUNT_CHANGED", "Order totals changed after payment was prepared.");
    }
    if (["PAID", "PARTIALLY_REFUNDED", "REFUNDED"].includes(existing.status)) {
      throw new AppError(409, "PAYMENT_ALREADY_CAPTURED", "This order already has a captured Razorpay payment.");
    }
    if (existing.status === "FAILED") {
      await prisma.payment.update({ where: { id: existing.id }, data: { status: "PENDING" } });
    }
    return {
      paymentId: existing.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: existing.providerOrderId,
      keyId: getRazorpayPublicKey(),
      amountPaise: order.totalPaise,
      currency: order.currency,
    };
  }

  const providerOrder = await createRazorpayProviderOrder({
    amountPaise: order.totalPaise,
    currency: order.currency,
    receipt: order.orderNumber,
    localOrderId: order.id,
  });
  if (providerOrder.amount !== order.totalPaise || providerOrder.currency !== order.currency) {
    throw new AppError(502, "RAZORPAY_ORDER_MISMATCH", "Razorpay returned an unexpected order amount.");
  }

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "RAZORPAY",
      providerOrderId: providerOrder.id,
      amountPaise: order.totalPaise,
      currency: order.currency,
      status: "PENDING",
    },
  });

  return {
    paymentId: payment.id,
    orderId: order.id,
    orderNumber: order.orderNumber,
    razorpayOrderId: providerOrder.id,
    keyId: getRazorpayPublicKey(),
    amountPaise: order.totalPaise,
    currency: order.currency,
  };
}

async function commitInventoryAndConfirm(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        inventoryCommittedAt: true,
        items: { select: { productId: true, productName: true, quantity: true } },
      },
    });
    if (!order) throw new AppError(404, "ORDER_NOT_FOUND", "Order not found.");
    if (["CANCELLED", "REFUNDED"].includes(order.status)) return false;
    if (order.status !== "PENDING") return true;

    if (!order.inventoryCommittedAt) {
      for (const item of order.items) {
        if (!item.productId) continue;
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, active: true, stockStatus: true, stockQuantity: true },
        });
        if (!product || !product.active || product.stockStatus !== "IN_STOCK") {
          throw new AppError(409, "PAID_ORDER_STOCK_CONFLICT", `${item.productName} is no longer available.`);
        }
        if (product.stockQuantity === null) continue;
        const updated = await tx.product.updateMany({
          where: {
            id: product.id,
            active: true,
            stockStatus: "IN_STOCK",
            stockQuantity: { gte: item.quantity },
          },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        if (updated.count !== 1) {
          throw new AppError(409, "PAID_ORDER_STOCK_CONFLICT", `${item.productName} no longer has enough stock.`);
        }
        await tx.product.updateMany({
          where: { id: product.id, stockQuantity: 0 },
          data: { stockStatus: "OUT_OF_STOCK" },
        });
      }
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "CONFIRMED",
        ...(order.inventoryCommittedAt ? {} : { inventoryCommittedAt: new Date() }),
      },
    });
    return true;
  });
}

async function releaseUnshippedInventory(tx: Prisma.TransactionClient, orderId: string) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: {
      inventoryCommittedAt: true,
      shippedAt: true,
      items: { select: { productId: true, quantity: true } },
    },
  });
  if (!order?.inventoryCommittedAt || order.shippedAt) return;
  for (const item of order.items) {
    if (!item.productId) continue;
    const product = await tx.product.findUnique({
      where: { id: item.productId },
      select: { stockQuantity: true },
    });
    if (!product || product.stockQuantity === null) continue;
    await tx.product.update({
      where: { id: item.productId },
      data: { stockQuantity: { increment: item.quantity }, stockStatus: "IN_STOCK" },
    });
  }
  await tx.order.update({ where: { id: orderId }, data: { inventoryCommittedAt: null } });
}

async function markCaptured(input: {
  paymentId: string;
  providerPaymentId: string;
  providerOrderId: string;
  amountPaise: number;
  currency: string;
  verifiedAt: Date;
  eventId?: string;
  eventType?: string;
  payloadHash?: string;
}) {
  const updated = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: input.paymentId },
      select: {
        id: true,
        orderId: true,
        amountPaise: true,
        refundedAmountPaise: true,
        currency: true,
        providerOrderId: true,
        status: true,
      },
    });
    if (!payment || payment.providerOrderId !== input.providerOrderId) {
      throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment could not be matched to the order.");
    }
    if (payment.amountPaise !== input.amountPaise || payment.currency !== input.currency) {
      throw new AppError(409, "PAYMENT_AMOUNT_MISMATCH", "Captured payment amount does not match the server order.");
    }
    const reconciledStatus = payment.refundedAmountPaise >= payment.amountPaise
      ? "REFUNDED"
      : payment.refundedAmountPaise > 0
        ? "PARTIALLY_REFUNDED"
        : "PAID";
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: input.providerPaymentId,
        status: reconciledStatus,
        verifiedAt: input.verifiedAt,
      },
    });
    if (input.eventId && input.eventType) {
      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          providerEventId: input.eventId,
          eventType: input.eventType,
          payloadHash: input.payloadHash ?? null,
        },
      });
    }
    return { paymentId: payment.id, orderId: payment.orderId, paymentStatus: reconciledStatus };
  });

  let fulfillmentReady = true;
  if (updated.paymentStatus === "PAID") {
    try {
      fulfillmentReady = await commitInventoryAndConfirm(updated.orderId);
    } catch (error) {
      fulfillmentReady = false;
      logger.error("Captured Razorpay payment requires stock review", {
        paymentId: updated.paymentId,
        orderId: updated.orderId,
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }
  return { ...updated, fulfillmentReady };
}

export async function verifyRazorpayPayment(body: VerifyRazorpayPaymentBody) {
  const { keySecret } = ensureRazorpay();
  const payment = await prisma.payment.findUnique({
    where: { id: body.paymentId },
    select: { id: true, orderId: true, providerOrderId: true, amountPaise: true, currency: true },
  });
  if (!payment?.providerOrderId) throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment not found.");
  if (body.razorpayOrderId !== payment.providerOrderId) {
    throw new AppError(400, "PAYMENT_SIGNATURE_INVALID", "Razorpay order id does not match the server payment.");
  }

  const expected = createHmac("sha256", keySecret)
    .update(`${payment.providerOrderId}|${body.razorpayPaymentId}`)
    .digest("hex");
  if (!safeHexEqual(expected, body.razorpaySignature)) {
    throw new AppError(400, "PAYMENT_SIGNATURE_INVALID", "Razorpay payment signature is invalid.");
  }

  const providerPayment = await fetchRazorpayPayment(body.razorpayPaymentId);
  if (
    providerPayment.id !== body.razorpayPaymentId ||
    providerPayment.order_id !== payment.providerOrderId ||
    providerPayment.amount !== payment.amountPaise ||
    providerPayment.currency !== payment.currency
  ) {
    throw new AppError(409, "PAYMENT_PROVIDER_MISMATCH", "Razorpay payment details do not match the server order.");
  }

  if (providerPayment.status === "captured" && providerPayment.captured) {
    const result = await markCaptured({
      paymentId: payment.id,
      providerPaymentId: providerPayment.id,
      providerOrderId: payment.providerOrderId,
      amountPaise: payment.amountPaise,
      currency: payment.currency,
      verifiedAt: new Date(),
    });
    return {
      verified: true,
      paid: true,
      orderId: payment.orderId,
      fulfillmentReady: result.fulfillmentReady,
    };
  }

  if (providerPayment.status === "authorized") {
    await prisma.payment.updateMany({
      where: {
        id: payment.id,
        status: { notIn: ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"] },
      },
      data: { providerPaymentId: providerPayment.id, status: "PENDING", verifiedAt: new Date() },
    });
    return { verified: true, paid: false, orderId: payment.orderId, fulfillmentReady: false };
  }

  await prisma.payment.updateMany({
    where: {
      id: payment.id,
      status: { notIn: ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"] },
    },
    data: { providerPaymentId: providerPayment.id, status: "FAILED", verifiedAt: new Date() },
  });
  throw new AppError(409, "PAYMENT_NOT_CAPTURED", "Razorpay has not captured this payment.");
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function entityFrom(payload: Record<string, unknown>, key: string) {
  const wrapper = asObject(payload[key]);
  return wrapper ? asObject(wrapper.entity) : null;
}

function stringValue(object: Record<string, unknown> | null, key: string) {
  const value = object?.[key];
  return typeof value === "string" ? value : null;
}

function numberValue(object: Record<string, unknown> | null, key: string) {
  const value = object?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

async function processCapturedWebhook(
  eventId: string,
  eventType: string,
  payloadHashValue: string,
  paymentEntity: Record<string, unknown>,
) {
  const providerOrderId = stringValue(paymentEntity, "order_id");
  const providerPaymentId = stringValue(paymentEntity, "id");
  const amount = numberValue(paymentEntity, "amount");
  const currency = stringValue(paymentEntity, "currency");
  if (!providerOrderId || !providerPaymentId || amount === null || !currency) return;

  const localPayment = await prisma.payment.findFirst({
    where: {
      provider: "RAZORPAY",
      OR: [{ providerOrderId }, { providerPaymentId }],
    },
    select: { id: true, amountPaise: true, currency: true, providerOrderId: true },
  });
  if (!localPayment?.providerOrderId) return;

  await markCaptured({
    paymentId: localPayment.id,
    providerPaymentId,
    providerOrderId: localPayment.providerOrderId,
    amountPaise: amount,
    currency,
    verifiedAt: new Date(),
    eventId,
    eventType,
    payloadHash: payloadHashValue,
  });
}

async function syncRefundTotals(tx: Prisma.TransactionClient, paymentId: string) {
  const payment = await tx.payment.findUnique({
    where: { id: paymentId },
    select: { id: true, orderId: true, amountPaise: true },
  });
  if (!payment) return;
  const aggregate = await tx.refund.aggregate({
    where: { paymentId, status: "PROCESSED" },
    _sum: { amountPaise: true },
  });
  const refunded = Math.min(payment.amountPaise, aggregate._sum.amountPaise ?? 0);
  const status = refunded >= payment.amountPaise ? "REFUNDED" : refunded > 0 ? "PARTIALLY_REFUNDED" : "PAID";
  await tx.payment.update({
    where: { id: paymentId },
    data: { refundedAmountPaise: refunded, status },
  });
  if (status === "REFUNDED") {
    await releaseUnshippedInventory(tx, payment.orderId);
    await tx.order.update({ where: { id: payment.orderId }, data: { status: "REFUNDED" } });
  }
}

const refundStatusRank = {
  CREATED: 0,
  PROCESSING: 1,
  FAILED: 2,
  PROCESSED: 3,
} as const;

type RefundState = keyof typeof refundStatusRank;

function laterRefundStatus(current: RefundState | null, incoming: RefundState): RefundState {
  if (!current) return incoming;
  return refundStatusRank[current] >= refundStatusRank[incoming] ? current : incoming;
}

async function processRefundWebhook(
  tx: Prisma.TransactionClient,
  eventType: string,
  refundEntity: Record<string, unknown>,
  reason?: string,
) {
  const providerRefundId = stringValue(refundEntity, "id");
  const providerPaymentId = stringValue(refundEntity, "payment_id");
  const amountPaise = numberValue(refundEntity, "amount");
  if (!providerRefundId || !providerPaymentId || amountPaise === null) return null;
  const payment = await tx.payment.findFirst({
    where: { provider: "RAZORPAY", providerPaymentId },
    select: { id: true },
  });
  if (!payment) return null;

  const incomingStatus: RefundState = eventType === "refund.processed"
    ? "PROCESSED"
    : eventType === "refund.failed"
      ? "FAILED"
      : "PROCESSING";
  const existing = await tx.refund.findUnique({
    where: { providerRefundId },
    select: { status: true },
  });
  const status = laterRefundStatus(existing?.status ?? null, incomingStatus);

  await tx.refund.upsert({
    where: { providerRefundId },
    create: { paymentId: payment.id, providerRefundId, amountPaise, status, reason: reason ?? null },
    update: { amountPaise, status, ...(reason ? { reason } : {}) },
  });
  if (status === "PROCESSED") await syncRefundTotals(tx, payment.id);
  return payment.id;
}

export async function handleRazorpayWebhook(rawBody: Buffer, signature: string | undefined, eventHeader: string | undefined) {
  const { webhookSecret } = ensureRazorpay();
  if (!signature) throw new AppError(400, "WEBHOOK_SIGNATURE_MISSING", "Razorpay webhook signature is missing.");
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  if (!safeHexEqual(expected, signature)) {
    throw new AppError(400, "WEBHOOK_SIGNATURE_INVALID", "Razorpay webhook signature is invalid.");
  }

  const payloadHashValue = hashPayload(rawBody);
  const eventId = eventHeader?.trim() || `payload-${payloadHashValue}`;
  const alreadyProcessed = await prisma.paymentEvent.findUnique({ where: { providerEventId: eventId }, select: { id: true } });
  if (alreadyProcessed) return { accepted: true, duplicate: true };

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody.toString("utf8"));
  } catch {
    throw new AppError(400, "WEBHOOK_JSON_INVALID", "Razorpay webhook payload is invalid.");
  }
  const event = asObject(parsed);
  const eventType = typeof event?.event === "string" ? event.event : "unknown";
  const payload = asObject(event?.payload) ?? {};
  const paymentEntity = entityFrom(payload, "payment");
  const refundEntity = entityFrom(payload, "refund");

  if ((eventType === "payment.captured" || eventType === "order.paid") && paymentEntity) {
    await processCapturedWebhook(eventId, eventType, payloadHashValue, paymentEntity);
    const recorded = await prisma.paymentEvent.findUnique({ where: { providerEventId: eventId }, select: { id: true } });
    if (!recorded) {
      await prisma.paymentEvent.create({ data: { providerEventId: eventId, eventType, payloadHash: payloadHashValue } });
    }
    return { accepted: true, duplicate: false };
  }

  await prisma.$transaction(async (tx) => {
    let paymentId: string | null = null;
    if ((eventType === "payment.authorized" || eventType === "payment.failed") && paymentEntity) {
      const providerOrderId = stringValue(paymentEntity, "order_id");
      const providerPaymentId = stringValue(paymentEntity, "id");
      if (providerOrderId && providerPaymentId) {
        const payment = await tx.payment.findFirst({
          where: { provider: "RAZORPAY", providerOrderId },
          select: { id: true, status: true },
        });
        if (payment) {
          paymentId = payment.id;
          const terminalPaid = ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"].includes(payment.status);
          if (eventType === "payment.authorized" && !terminalPaid) {
            await tx.payment.update({ where: { id: payment.id }, data: { providerPaymentId, status: "PENDING" } });
          }
          if (eventType === "payment.failed" && !terminalPaid) {
            await tx.payment.update({ where: { id: payment.id }, data: { providerPaymentId, status: "FAILED" } });
          }
        }
      }
    }

    if (refundEntity && ["refund.created", "refund.processed", "refund.failed"].includes(eventType)) {
      paymentId = await processRefundWebhook(tx, eventType, refundEntity) ?? paymentId;
    }

    await tx.paymentEvent.create({
      data: {
        paymentId,
        providerEventId: eventId,
        eventType,
        payloadHash: payloadHashValue,
      },
    });
  });

  return { accepted: true, duplicate: false };
}

export async function refundAdminOrder(orderId: string, body: AdminRefundBody) {
  ensureRazorpay();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      payments: {
        where: { provider: "RAZORPAY", status: { in: ["PAID", "PARTIALLY_REFUNDED"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  const payment = order?.payments[0];
  if (!order || !payment?.providerPaymentId) {
    throw new AppError(409, "REFUND_NOT_AVAILABLE", "This order does not have a captured Razorpay payment to refund.");
  }

  const pendingRefund = await prisma.refund.findFirst({
    where: { paymentId: payment.id, status: { in: ["CREATED", "PROCESSING"] } },
    select: { providerRefundId: true },
  });
  if (pendingRefund) {
    throw new AppError(409, "REFUND_PENDING", "A Razorpay refund is already processing for this payment.");
  }

  const remaining = payment.amountPaise - payment.refundedAmountPaise;
  const amountPaise = body.amountPaise ?? remaining;
  if (amountPaise <= 0 || amountPaise > remaining) {
    throw new AppError(400, "REFUND_AMOUNT_INVALID", "Refund amount exceeds the remaining captured payment amount.");
  }

  const idempotencyKey = `joyneeds_${createHash("sha256")
    .update(`${payment.id}:${payment.refundedAmountPaise}:${amountPaise}`)
    .digest("hex")
    .slice(0, 32)}`;
  const providerRefund = await refundRazorpayPayment({
    providerPaymentId: payment.providerPaymentId,
    amountPaise,
    idempotencyKey,
    orderNumber: order.orderNumber,
    ...(body.reason ? { reason: body.reason } : {}),
  });

  await prisma.$transaction(async (tx) => {
    const incomingStatus: RefundState = providerRefund.status === "processed"
      ? "PROCESSED"
      : providerRefund.status === "failed"
        ? "FAILED"
        : "PROCESSING";
    const existing = await tx.refund.findUnique({
      where: { providerRefundId: providerRefund.id },
      select: { status: true },
    });
    const status = laterRefundStatus(existing?.status ?? null, incomingStatus);
    await tx.refund.upsert({
      where: { providerRefundId: providerRefund.id },
      create: {
        paymentId: payment.id,
        providerRefundId: providerRefund.id,
        amountPaise: providerRefund.amount,
        status,
        reason: body.reason ?? null,
      },
      update: { amountPaise: providerRefund.amount, status, ...(body.reason ? { reason: body.reason } : {}) },
    });
    await tx.paymentEvent.upsert({
      where: { providerEventId: `refund-api:${providerRefund.id}` },
      create: {
        paymentId: payment.id,
        providerEventId: `refund-api:${providerRefund.id}`,
        eventType: "refund.requested",
        payloadHash: createHash("sha256").update(`${providerRefund.id}:${providerRefund.amount}:${providerRefund.status}`).digest("hex"),
      },
      update: {},
    });
    if (status === "PROCESSED") await syncRefundTotals(tx, payment.id);
  });

  return {
    refundId: providerRefund.id,
    amountPaise: providerRefund.amount,
    status: providerRefund.status,
    orderId: order.id,
  };
}
