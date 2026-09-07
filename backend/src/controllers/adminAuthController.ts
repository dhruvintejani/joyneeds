import type { RequestHandler } from "express";
import {
  ADMIN_SESSION_COOKIE,
  clearAdminSessionCookie,
  loginAdmin,
  logoutAdmin,
  readCookie,
  setAdminSessionCookie,
} from "../services/adminAuthService.js";
import type { AdminLoginBody } from "../validators/adminValidators.js";

export const adminLoginController: RequestHandler = async (_req, res) => {
  const { email, password } = res.locals.validatedBody as AdminLoginBody;
  const session = await loginAdmin(email, password);
  setAdminSessionCookie(res, session.token);
  res.json({
    data: {
      authenticated: true,
      admin: true,
      email: session.email,
      expiresAt: session.expiresAt,
    },
  });
};

export const adminAuthSessionController: RequestHandler = (_req, res) => {
  res.json({
    data: {
      authenticated: true,
      admin: true,
      email: res.locals.adminEmail as string,
    },
  });
};

export const adminLogoutController: RequestHandler = async (req, res) => {
  const token = readCookie(req.headers.cookie, ADMIN_SESSION_COOKIE);
  await logoutAdmin(token);
  clearAdminSessionCookie(res);
  res.status(204).end();
};
