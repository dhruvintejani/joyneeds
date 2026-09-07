import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { healthRouter } from "./routes/healthRoutes.js";
import { AppError } from "./utils/AppError.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

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

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
