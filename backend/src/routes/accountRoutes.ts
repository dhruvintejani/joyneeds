import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getAccountController } from "../controllers/accountController.js";
import { getCustomerCartController, syncCustomerCartController } from "../controllers/cartController.js";
import { getCustomerOrderController, listCustomerOrdersController } from "../controllers/orderController.js";
import { requireCustomer } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validateRequest.js";
import { cartSyncSchema, customerOrderParamsSchema } from "../validators/orderValidators.js";

export const accountRouter = Router();

accountRouter.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
accountRouter.use(requireCustomer);
accountRouter.get("/", getAccountController);
accountRouter.get("/cart", getCustomerCartController);
accountRouter.put("/cart", validateBody(cartSyncSchema), syncCustomerCartController);
accountRouter.get("/orders", listCustomerOrdersController);
accountRouter.get(
  "/orders/:orderNumber",
  validateParams(customerOrderParamsSchema),
  getCustomerOrderController,
);
