import { createHash } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { logger } from "../utils/logger.js";
import { isBrevoConfigured, sendBrevoTransactionalEmail } from "./brevoClient.js";

const EMAILABLE_STATUSES = new Set([
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(paise: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

function statusCopy(status: string, orderNumber: string) {
  switch (status) {
    case "CONFIRMED":
      return {
        subject: `Order confirmed — ${orderNumber}`,
        heading: "Your order is confirmed",
        message: "We have verified your payment and confirmed your JoyNeeds order.",
      };
    case "PROCESSING":
      return {
        subject: `Order update — ${orderNumber} is processing`,
        heading: "Your order is being processed",
        message: "Your JoyNeeds order is now being prepared for shipment.",
      };
    case "SHIPPED":
      return {
        subject: `Your JoyNeeds order ${orderNumber} has shipped`,
        heading: "Your order has shipped",
        message: "Your JoyNeeds order is on its way.",
      };
    case "DELIVERED":
      return {
        subject: `Order delivered — ${orderNumber}`,
        heading: "Your order was delivered",
        message: "Our records show that your JoyNeeds order has been delivered.",
      };
    case "CANCELLED":
      return {
        subject: `Order cancelled — ${orderNumber}`,
        heading: "Your order was cancelled",
        message: "Your JoyNeeds order has been cancelled.",
      };
    case "REFUNDED":
      return {
        subject: `Refund completed — ${orderNumber}`,
        heading: "Your order was refunded",
        message: "The full payment for this JoyNeeds order has been refunded through the payment provider.",
      };
    default:
      return null;
  }
}

async function buildOrderMessage(orderId: string, status: string) {
  if (!EMAILABLE_STATUSES.has(status)) return null;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      customerName: true,
      customerEmail: true,
      totalPaise: true,
      currency: true,
      courier: true,
      trackingNumber: true,
      trackingUrl: true,
      items: {
        select: {
          productName: true,
          quantity: true,
          pricePaise: true,
        },
      },
    },
  });
  if (!order || order.status !== status) return null;

  const copy = statusCopy(status, order.orderNumber);
  if (!copy) return null;
  const itemRows = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb">${escapeHtml(item.productName)} × ${item.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right">${escapeHtml(money(item.pricePaise * item.quantity, order.currency))}</td></tr>`,
    )
    .join("");
  const textItems = order.items
    .map((item) => `${item.productName} × ${item.quantity} — ${money(item.pricePaise * item.quantity, order.currency)}`)
    .join("\n");

  const trackingHtml =
    status === "SHIPPED" && (order.courier || order.trackingNumber || order.trackingUrl)
      ? `<div style="margin:20px 0;padding:14px;background:#f7f9fc;border-radius:8px"><strong>Shipping details</strong><br>${order.courier ? `Courier: ${escapeHtml(order.courier)}<br>` : ""}${order.trackingNumber ? `Tracking number: ${escapeHtml(order.trackingNumber)}<br>` : ""}${order.trackingUrl ? `<a href="${escapeHtml(order.trackingUrl)}" style="color:#17365d">Track your order</a>` : ""}</div>`
      : "";
  const trackingText =
    status === "SHIPPED"
      ? [order.courier ? `Courier: ${order.courier}` : null, order.trackingNumber ? `Tracking number: ${order.trackingNumber}` : null, order.trackingUrl ? `Tracking: ${order.trackingUrl}` : null]
          .filter(Boolean)
          .join("\n")
      : "";

  const htmlContent = `<!doctype html><html><body style="margin:0;background:#f3f6fa;font-family:Arial,sans-serif;color:#172033"><div style="max-width:640px;margin:0 auto;padding:28px 16px"><div style="background:#ffffff;border-radius:12px;padding:28px;border:1px solid #e5e7eb"><div style="font-size:24px;font-weight:700;color:#17365d;margin-bottom:20px">JoyNeeds</div><h1 style="font-size:24px;margin:0 0 10px">${escapeHtml(copy.heading)}</h1><p style="line-height:1.6">Hi ${escapeHtml(order.customerName)},</p><p style="line-height:1.6">${escapeHtml(copy.message)}</p><p><strong>Order:</strong> ${escapeHtml(order.orderNumber)}</p>${trackingHtml}<table style="width:100%;border-collapse:collapse;margin-top:18px">${itemRows}<tr><td style="padding:14px 0;font-weight:700">Total</td><td style="padding:14px 0;text-align:right;font-weight:700">${escapeHtml(money(order.totalPaise, order.currency))}</td></tr></table><p style="margin-top:24px;color:#64748b;font-size:13px">This is a transactional message about your JoyNeeds order.</p></div></div></body></html>`;
  const textContent = `JoyNeeds\n\n${copy.heading}\n\nHi ${order.customerName},\n\n${copy.message}\n\nOrder: ${order.orderNumber}\n${trackingText ? `\n${trackingText}\n` : ""}\n${textItems}\n\nTotal: ${money(order.totalPaise, order.currency)}\n\nThis is a transactional message about your JoyNeeds order.`;

  return {
    order,
    subject: copy.subject,
    htmlContent,
    textContent,
  };
}

function providerIdempotencyKey(dedupeKey: string) {
  return `joyneeds-${createHash("sha256").update(dedupeKey).digest("hex").slice(0, 40)}`;
}

export async function sendOrderStatusEmailOnce(orderId: string, status: string) {
  if (!isBrevoConfigured()) return { skipped: true as const, reason: "BREVO_NOT_CONFIGURED" as const };

  const message = await buildOrderMessage(orderId, status);
  if (!message) return { skipped: true as const, reason: "ORDER_STATUS_NOT_EMAILABLE" as const };

  const dedupeKey = `order:${message.order.id}:status:${status}`;
  const delivery = await prisma.emailDelivery.upsert({
    where: { dedupeKey },
    create: {
      orderId: message.order.id,
      dedupeKey,
      messageType: `ORDER_${status}`,
      recipientEmail: message.order.customerEmail,
      recipientName: message.order.customerName,
      subject: message.subject,
      status: "PENDING",
    },
    update: {},
  });

  if (delivery.status === "SENT") {
    return { skipped: true as const, reason: "ALREADY_SENT" as const, deliveryId: delivery.id };
  }

  const now = new Date();
  const staleBefore = new Date(now.getTime() - 10 * 60 * 1000);
  const claimed = await prisma.emailDelivery.updateMany({
    where: {
      id: delivery.id,
      OR: [
        { status: { in: ["PENDING", "FAILED"] } },
        { status: "SENDING", lastAttemptAt: { lt: staleBefore } },
      ],
    },
    data: {
      status: "SENDING",
      attemptCount: { increment: 1 },
      lastAttemptAt: now,
      lastError: null,
    },
  });

  if (claimed.count !== 1) {
    return { skipped: true as const, reason: "SEND_IN_PROGRESS" as const, deliveryId: delivery.id };
  }

  try {
    const result = await sendBrevoTransactionalEmail({
      to: { email: message.order.customerEmail, name: message.order.customerName },
      subject: message.subject,
      htmlContent: message.htmlContent,
      textContent: message.textContent,
      idempotencyKey: providerIdempotencyKey(dedupeKey),
    });
    await prisma.emailDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "SENT",
        providerMessageId: result.messageId,
        sentAt: new Date(),
        lastError: null,
      },
    });
    return { sent: true as const, deliveryId: delivery.id, providerMessageId: result.messageId };
  } catch (error) {
    const messageText = error instanceof Error ? error.message.slice(0, 500) : "Transactional email failed.";
    await prisma.emailDelivery.update({
      where: { id: delivery.id },
      data: { status: "FAILED", lastError: messageText },
    });
    throw error;
  }
}

export async function notifyOrderStatusSafely(orderId: string, status: string) {
  try {
    return await sendOrderStatusEmailOnce(orderId, status);
  } catch (error) {
    logger.error("Transactional order email failed without affecting order state", {
      orderId,
      status,
      error: error instanceof Error ? error.message : "unknown",
    });
    return { sent: false as const, failed: true as const };
  }
}
