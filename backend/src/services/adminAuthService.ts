import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Response } from "express";
import { adminAuthConfigured, env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export const ADMIN_SESSION_COOKIE = "jn_admin_session";

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function readCookie(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function sessionMaxAgeMs() {
  return env.ADMIN_SESSION_TTL_HOURS * 60 * 60 * 1000;
}

export function setAdminSessionCookie(res: Response, token: string) {
  res.cookie(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/admin",
    maxAge: sessionMaxAgeMs(),
  });
}

export function clearAdminSessionCookie(res: Response) {
  res.clearCookie(ADMIN_SESSION_COOKIE, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/admin",
  });
}

export async function loginAdmin(email: string, password: string) {
  if (!adminAuthConfigured || !env.ADMIN_EMAIL || !env.ADMIN_PASSWORD_HASH) {
    throw new AppError(503, "ADMIN_AUTH_NOT_CONFIGURED", "Admin authentication is not configured yet.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (bcrypt.truncates(password)) {
    throw new AppError(401, "ADMIN_LOGIN_FAILED", "Invalid email or password.");
  }

  const passwordValid = await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
  if (!passwordValid || normalizedEmail !== env.ADMIN_EMAIL) {
    throw new AppError(401, "ADMIN_LOGIN_FAILED", "Invalid email or password.");
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionMaxAgeMs());

  await prisma.$transaction([
    prisma.adminSession.deleteMany({ where: { expiresAt: { lte: new Date() } } }),
    prisma.adminSession.create({
      data: {
        tokenHash: tokenHash(token),
        email: env.ADMIN_EMAIL,
        expiresAt,
      },
    }),
  ]);

  return { token, email: env.ADMIN_EMAIL, expiresAt };
}

export async function getAdminSession(token: string | null) {
  if (!adminAuthConfigured) {
    throw new AppError(503, "ADMIN_AUTH_NOT_CONFIGURED", "Admin authentication is not configured yet.");
  }
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: tokenHash(token) },
  });

  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  return session;
}

export async function touchAdminSession(id: string) {
  await prisma.adminSession.update({ where: { id }, data: { lastSeenAt: new Date() } }).catch(() => undefined);
}

export async function logoutAdmin(token: string | null) {
  if (!token) return;
  await prisma.adminSession.deleteMany({ where: { tokenHash: tokenHash(token) } });
}
