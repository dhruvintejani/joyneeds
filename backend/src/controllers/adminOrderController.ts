import type { RequestHandler } from "express";
import { notifyOrderStatusSafely } from "../services/emailService.js";
import { getAdminOrder, listAdminOrders, updateAdminOrder } from "../services/orderService.js";
import type {
  AdminOrderListQuery,
  AdminOrderParams,
  AdminOrderUpdateBody,
} from "../validators/orderValidators.js";

export const adminListOrdersController: RequestHandler = async (_req, res) => {
  res.json({ data: await listAdminOrders(res.locals.validatedQuery as AdminOrderListQuery) });
};

export const adminGetOrderController: RequestHandler = async (_req, res) => {
  const { id } = res.locals.validatedParams as AdminOrderParams;
  res.json({ data: await getAdminOrder(id) });
};

export const adminUpdateOrderController: RequestHandler = async (_req, res) => {
  const { id } = res.locals.validatedParams as AdminOrderParams;
  const order = await updateAdminOrder(id, res.locals.validatedBody as AdminOrderUpdateBody);
  await notifyOrderStatusSafely(order.id, order.status);
  res.json({ data: order });
};
