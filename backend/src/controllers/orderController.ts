import type { RequestHandler } from "express";
import { razorpayConfigured } from "../config/env.js";
import { createPendingOrder, getCustomerOrder, listCustomerOrders } from "../services/orderService.js";
import type { CreateOrderBody, CustomerOrderParams } from "../validators/orderValidators.js";

export const createOrderController: RequestHandler = async (_req, res) => {
  const clerkUserId = (res.locals.clerkUserId as string | undefined) ?? null;
  const order = await createPendingOrder(res.locals.validatedBody as CreateOrderBody, clerkUserId);
  res.status(201).json({
    data: {
      ...order,
      paymentReady: razorpayConfigured,
      inventoryReserved: false,
      note: "Payment must be verified server-side before the order is confirmed and inventory is committed.",
    },
  });
};

export const listCustomerOrdersController: RequestHandler = async (_req, res) => {
  res.json({ data: await listCustomerOrders(res.locals.clerkUserId as string) });
};

export const getCustomerOrderController: RequestHandler = async (_req, res) => {
  const { orderNumber } = res.locals.validatedParams as CustomerOrderParams;
  res.json({ data: await getCustomerOrder(res.locals.clerkUserId as string, orderNumber) });
};
