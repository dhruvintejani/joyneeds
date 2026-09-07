import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.js";
import {
  createRazorpayOrder,
  handleRazorpayWebhook,
  refundAdminOrder,
  verifyRazorpayPayment,
} from "../services/paymentService.js";
import { AppError } from "../utils/AppError.js";
import type {
  AdminRefundBody,
  CreateRazorpayOrderBody,
  VerifyRazorpayPaymentBody,
} from "../validators/paymentValidators.js";
import type { AdminOrderParams } from "../validators/orderValidators.js";

export const createRazorpayOrderController: RequestHandler = async (_req, res) => {
  const clerkUserId = (res.locals.clerkUserId as string | undefined) ?? null;
  const body = res.locals.validatedBody as CreateRazorpayOrderBody;
  const paid = await prisma.payment.findFirst({
    where: {
      orderId: body.orderId,
      provider: "RAZORPAY",
      status: { in: ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"] },
    },
    select: { id: true },
  });
  if (paid) {
    throw new AppError(409, "PAYMENT_ALREADY_CAPTURED", "This order already has a captured Razorpay payment.");
  }
  const data = await createRazorpayOrder(body, clerkUserId);
  res.status(201).json({ data });
};

export const verifyRazorpayPaymentController: RequestHandler = async (_req, res) => {
  const data = await verifyRazorpayPayment(res.locals.validatedBody as VerifyRazorpayPaymentBody);
  res.json({ data });
};

export const razorpayWebhookController: RequestHandler = async (req, res) => {
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from([]);
  const signature = req.header("x-razorpay-signature") ?? undefined;
  const eventId = req.header("x-razorpay-event-id") ?? undefined;
  const data = await handleRazorpayWebhook(rawBody, signature, eventId);
  res.json({ data });
};

export const adminRefundOrderController: RequestHandler = async (_req, res) => {
  const { id } = res.locals.validatedParams as AdminOrderParams;
  const data = await refundAdminOrder(id, res.locals.validatedBody as AdminRefundBody);
  res.status(201).json({ data });
};
