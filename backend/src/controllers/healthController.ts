import { configuredPaymentProvider, env, orderCreationEnabled } from "../config/env.js";
import type { RequestHandler } from "express";
import { getHealthStatus, getReadinessStatus } from "../services/healthService.js";

export const getHealth: RequestHandler = (_req, res) => {
  res.status(200).json({ data: getHealthStatus() });
};

export const getReadiness: RequestHandler = async (_req, res) => {
  const data = await getReadinessStatus();
  res.status(data.status === "ready" ? 200 : 503).json({ data });
};

export const getCheckoutFeatures: RequestHandler = (_req, res) => {
  res.set("Cache-Control", "no-store").json({ data: {
    checkoutEnabled: orderCreationEnabled && configuredPaymentProvider,
    paymentProvider: env.PAYMENT_PROVIDER,
    shippingFeePaise: env.SHIPPING_FEE_PAISE,
  } });
};
