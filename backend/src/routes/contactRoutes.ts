import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { env, brevoConfigured } from "../config/env.js";
import { validateBody } from "../middleware/validateRequest.js";
import { sendBrevoTransactionalEmail } from "../services/brevoClient.js";
import { AppError } from "../utils/AppError.js";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(200).optional(),
});
const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
export const contactRouter = Router();
contactRouter.get("/", (_req, res) => {
  res.set("Cache-Control", "no-store").json({ data: { enabled: brevoConfigured && Boolean(env.CONTACT_RECIPIENT_EMAIL) } });
});
contactRouter.post("/", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false }),
  (req, _res, next) => {
    if (req.get("origin") !== env.FRONTEND_URL) return next(new AppError(403, "CONTACT_ORIGIN_DENIED", "This request origin is not allowed."));
    next();
  },
  validateBody(contactSchema), async (_req, res) => {
    if (!brevoConfigured || !env.CONTACT_RECIPIENT_EMAIL) throw new AppError(503, "CONTACT_NOT_CONFIGURED", "Online enquiries are not configured. Please use the support email.");
    const { name, email, message, website } = res.locals.validatedBody as z.infer<typeof contactSchema>;
    if (website) throw new AppError(400, "INVALID_CONTACT", "Unable to accept this message.");
    try {
      await sendBrevoTransactionalEmail({
        to: { email: env.CONTACT_RECIPIENT_EMAIL }, replyTo: { email },
        subject: "New JoyNeeds website enquiry",
        textContent: "Name: " + name + "\nEmail: " + email + "\n\n" + message,
        htmlContent: "<p>Name: " + escapeHtml(name) + "</p><p>Email: " + escapeHtml(email) + "</p><p>" + escapeHtml(message).replaceAll("\n", "<br>") + "</p>",
        idempotencyKey: randomUUID(),
      });
      res.status(202).json({ data: { accepted: true } });
    } catch {
      throw new AppError(502, "CONTACT_DELIVERY_FAILED", "Unable to deliver your message right now. Please try again or use the support email.");
    }
  },
);
