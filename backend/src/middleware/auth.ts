import { clerkMiddleware, getAuth } from "@clerk/express";
import type { RequestHandler } from "express";
import { adminClerkUserIds, clerkConfigured } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export const clerkRequestMiddleware = clerkConfigured ? clerkMiddleware() : null;

export const requireAdmin: RequestHandler = (req, res, next) => {
  try {
    if (!clerkConfigured) {
      throw new AppError(
        503,
        "ADMIN_AUTH_NOT_CONFIGURED",
        "Admin authentication is not configured yet.",
      );
    }

    const { userId } = getAuth(req);
    if (!userId) {
      throw new AppError(401, "AUTH_REQUIRED", "Authentication is required.");
    }

    if (!adminClerkUserIds.size) {
      throw new AppError(
        503,
        "ADMIN_ALLOWLIST_NOT_CONFIGURED",
        "The admin allowlist is not configured yet.",
      );
    }

    if (!adminClerkUserIds.has(userId)) {
      throw new AppError(403, "ADMIN_FORBIDDEN", "This account does not have admin access.");
    }

    res.locals.clerkUserId = userId;
    next();
  } catch (error) {
    next(error);
  }
};
