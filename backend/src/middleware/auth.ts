import { clerkMiddleware, getAuth } from "@clerk/express";
import type { RequestHandler } from "express";
import { clerkConfigured, env } from "../config/env.js";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSession,
  readCookie,
  touchAdminSession,
} from "../services/adminAuthService.js";
import { AppError } from "../utils/AppError.js";

export const clerkRequestMiddleware = clerkConfigured ? clerkMiddleware() : null;

export const optionalCustomer: RequestHandler = (req, res, next) => {
  try {
    if (!clerkConfigured) {
      next();
      return;
    }
    const { isAuthenticated, userId } = getAuth(req);
    if (isAuthenticated && userId) res.locals.clerkUserId = userId;
    next();
  } catch (error) {
    next(error);
  }
};

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

export const requireAdmin: RequestHandler = async (req, res, next) => {
  try {
    const token = readCookie(req.headers.cookie, ADMIN_SESSION_COOKIE);
    const session = await getAdminSession(token);
    if (!session) {
      throw new AppError(401, "ADMIN_AUTH_REQUIRED", "Admin sign-in is required.");
    }

    res.locals.adminSessionId = session.id;
    res.locals.adminEmail = session.email;
    void touchAdminSession(session.id);
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdminWriteOrigin: RequestHandler = (req, _res, next) => {
  const origin = req.get("origin");
  if (!origin || origin !== env.FRONTEND_URL) {
    next(new AppError(403, "ADMIN_ORIGIN_DENIED", "This admin request origin is not allowed."));
    return;
  }
  next();
};
