import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createOrderController } from "../controllers/orderController.js";
import { optionalCustomer } from "../middleware/auth.js";
import { validateBody } from "../middleware/validateRequest.js";
import { createOrderSchema } from "../validators/orderValidators.js";

export const orderRouter = Router();

orderRouter.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

orderRouter.post("/", optionalCustomer, validateBody(createOrderSchema), createOrderController);
