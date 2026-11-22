import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { createPaytmCheckout, reconcilePaytmStatus } from "../services/paytmService.js";

export const paytmCheckoutController: RequestHandler = async (_req, res) => {
  const orderId = (res.locals.validatedBody as { orderId: string }).orderId;
  const clerkUserId = (res.locals.clerkUserId as string | undefined) ?? null;
  const data = await createPaytmCheckout(orderId, clerkUserId);
  res.status(201).json({ data });
};
export const paytmStatusController: RequestHandler = async (_req, res) => {
  const { orderNumber } = res.locals.validatedBody as { orderNumber: string };
  const data = await reconcilePaytmStatus(orderNumber);
  res.json({ data });
};
export const paytmCallbackController: RequestHandler = async (req, res) => {
  // Never trust browser-provided Paytm callback data to mark an order paid.
  // Verify with Paytm server-side, and let the status page retry if unavailable.
  const orderNumber = typeof req.body?.ORDERID === "string" ? req.body.ORDERID : "";
  if (orderNumber && /^JN-[0-9]{8}-[A-F0-9]{8}$/.test(orderNumber)) {
    try { await reconcilePaytmStatus(orderNumber); } catch { /* Status page safely retries. */ }
  }
  const query = orderNumber && /^JN-[0-9]{8}-[A-F0-9]{8}$/.test(orderNumber)
    ? `?order=${encodeURIComponent(orderNumber)}` : "";
  res.redirect(303, env.FRONTEND_URL + "/payment-status" + query);
};
