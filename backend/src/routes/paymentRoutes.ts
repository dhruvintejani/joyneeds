import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createRazorpayOrderController,
  verifyRazorpayPaymentController,
} from "../controllers/paymentController.js";
import { optionalCustomer } from "../middleware/auth.js";
import { validateBody } from "../middleware/validateRequest.js";
import {
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
} from "../validators/paymentValidators.js";

export const paymentRouter = Router();

paymentRouter.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 40,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

paymentRouter.post(
  "/razorpay/order",
  optionalCustomer,
  validateBody(createRazorpayOrderSchema),
  createRazorpayOrderController,
);

paymentRouter.post(
  "/razorpay/verify",
  validateBody(verifyRazorpayPaymentSchema),
  verifyRazorpayPaymentController,
);
