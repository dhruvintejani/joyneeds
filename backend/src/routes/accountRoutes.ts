import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getAccountController } from "../controllers/accountController.js";
import { requireCustomer } from "../middleware/auth.js";

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
