import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createOrderController } from "../controllers/orderController.js";
import { orderCreationEnabled } from "../config/env.js";
import { optionalCustomer } from "../middleware/auth.js";
import { validateBody } from "../middleware/validateRequest.js";
import { createOrderSchema } from "../validators/orderValidators.js";
import { AppError } from "../utils/AppError.js";

export const orderRouter = Router();

orderRouter.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

orderRouter.post(
  "/",
  (_req, _res, next) => {
    if (!orderCreationEnabled) {
      next(
        new AppError(
          503,
          "ORDER_CREATION_DISABLED",
          "Order creation is disabled until checkout and payment configuration is approved.",
        ),
      );
      return;
    }
    next();
  },
  optionalCustomer,
  validateBody(createOrderSchema),
  createOrderController,
);
