import { clerkMiddleware, getAuth } from "@clerk/express";
import type { RequestHandler } from "express";
import { clerkConfigured } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export const clerkRequestMiddleware = clerkConfigured ? clerkMiddleware() : null;

export const requireCustomer: RequestHandler = (req, res, next) => {
  try {
    if (!clerkConfigured) {
      throw new AppError(
        503,
        "CUSTOMER_AUTH_NOT_CONFIGURED",
        "Customer sign-in is not configured yet.",
      );
    }

    const { isAuthenticated, userId } = getAuth(req);
    if (!isAuthenticated || !userId) {
      throw new AppError(401, "AUTH_REQUIRED", "Sign in to access this account.");
    }

    res.locals.clerkUserId = userId;
    next();
  } catch (error) {
    next(error);
  }
};

// Phase 5 replaces this fail-closed placeholder with the separate JoyNeeds
// admin email/password + secure session authentication required by the project brief.
export const requireAdmin: RequestHandler = (_req, _res, next) => {
  next(
    new AppError(
      503,
      "ADMIN_AUTH_NOT_CONFIGURED",
      "Admin authentication will be enabled with the dedicated admin session system.",
    ),
  );
};
