import type { RequestHandler } from "express";
import { getCustomerCart, syncCustomerCart } from "../services/cartService.js";
import type { CartSyncBody } from "../validators/orderValidators.js";

export const getCustomerCartController: RequestHandler = async (_req, res) => {
  res.json({ data: await getCustomerCart(res.locals.clerkUserId as string) });
};

export const syncCustomerCartController: RequestHandler = async (_req, res) => {
  res.json({
    data: await syncCustomerCart(
      res.locals.clerkUserId as string,
      res.locals.validatedBody as CartSyncBody,
    ),
  });
};
