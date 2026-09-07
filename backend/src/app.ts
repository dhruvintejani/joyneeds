import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { clerkConfigured, env } from "./config/env.js";
import { clerkRequestMiddleware } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { categoryRouter } from "./routes/categoryRoutes.js";
import { healthRouter } from "./routes/healthRoutes.js";
import { productRouter } from "./routes/productRoutes.js";
import { AppError } from "./utils/AppError.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// Clerk must run before route middleware so authenticated requests carry auth state.
// When keys are absent, public storefront APIs still work and admin APIs fail closed.
if (clerkConfigured && clerkRequestMiddleware) app.use(clerkRequestMiddleware);

app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || origin === env.FRONTEND_URL) {
        callback(null, true);
        return;
      }
      callback(new AppError(403, "CORS_ORIGIN_DENIED", "This origin is not allowed."));
    },
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

app.use("/api/health", healthRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
