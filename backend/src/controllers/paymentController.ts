import type { RequestHandler } from "express";
import {
  createRazorpayOrder,
  handleRazorpayWebhook,
  refundAdminOrder,
  verifyRazorpayPayment,
} from "../services/paymentService.js";
import type {
  AdminRefundBody,
  CreateRazorpayOrderBody,
  VerifyRazorpayPaymentBody,
} from "../validators/paymentValidators.js";
import type { AdminOrderParams } from "../validators/orderValidators.js";

export const createRazorpayOrderController: RequestHandler = async (_req, res) => {
  const clerkUserId = (res.locals.clerkUserId as string | undefined) ?? null;
  const data = await createRazorpayOrder(res.locals.validatedBody as CreateRazorpayOrderBody, clerkUserId);
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
