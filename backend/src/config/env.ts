import "dotenv/config";
import { z } from "zod";

const optionalSecret = z.string().trim().min(1).optional();

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    FRONTEND_URL: z.string().trim().url().transform((value) => value.replace(/\/+$/, "")).default("http://localhost:5173"),
    DATABASE_URL: z.string().trim().min(1, "DATABASE_URL is required").refine((value) => /^postgres(?:ql)?:\/\//i.test(value), "Use a PostgreSQL connection URL."),
    CLERK_PUBLISHABLE_KEY: optionalSecret,
    CLERK_SECRET_KEY: optionalSecret,
    ADMIN_EMAIL: z.string().trim().toLowerCase().email().optional(),
    ADMIN_PASSWORD_HASH: optionalSecret,
    ADMIN_SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(168).default(12),
    ORDER_CREATION_ENABLED: z.enum(["true", "false"]).default("false"),
    CLOUDINARY_CLOUD_NAME: optionalSecret,
    CLOUDINARY_API_KEY: optionalSecret,
    CLOUDINARY_API_SECRET: optionalSecret,
    CLOUDINARY_FOLDER: z.string().trim().min(1).max(120).default("joyneeds/products"),
    PAYMENT_PROVIDER: z.enum(["PAYTM", "RAZORPAY"]).default("PAYTM"),
    PAYTM_MID: optionalSecret,
    PAYTM_MERCHANT_KEY: optionalSecret,
    PAYTM_WEBSITE_NAME: optionalSecret,
    PAYTM_CALLBACK_URL: z.string().url().optional(),
    PAYTM_ENV: z.enum(["staging", "production"]).default("staging"),
    RAZORPAY_KEY_ID: optionalSecret,
    RAZORPAY_KEY_SECRET: optionalSecret,
    RAZORPAY_WEBHOOK_SECRET: optionalSecret,
    BREVO_API_KEY: optionalSecret,
    BREVO_SENDER_EMAIL: z.string().trim().toLowerCase().email().optional(),
    BREVO_SENDER_NAME: z.string().trim().min(1).max(100).default("JoyNeeds"),
    BREVO_REPLY_TO_EMAIL: z.string().trim().toLowerCase().email().optional(),
  })
  .superRefine((value, ctx) => {
    const frontend = URL.canParse(value.FRONTEND_URL) ? new URL(value.FRONTEND_URL) : null;
    if (!frontend || !["http:", "https:"].includes(frontend.protocol) || frontend.origin !== value.FRONTEND_URL || (value.NODE_ENV === "production" && frontend.protocol !== "https:")) {
      ctx.addIssue({ code: "custom", path: ["FRONTEND_URL"], message: "Use the exact frontend origin (HTTPS in production), without a path, query, or fragment." });
    }
    if (value.ADMIN_PASSWORD_HASH && !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value.ADMIN_PASSWORD_HASH)) {
      ctx.addIssue({ code: "custom", path: ["ADMIN_PASSWORD_HASH"], message: "Use a bcrypt password hash, never a plaintext password." });
    }
    const hasPublishable = Boolean(value.CLERK_PUBLISHABLE_KEY);
    const hasSecret = Boolean(value.CLERK_SECRET_KEY);
    if (hasPublishable !== hasSecret) {
      ctx.addIssue({
        code: "custom",
        path: [hasPublishable ? "CLERK_SECRET_KEY" : "CLERK_PUBLISHABLE_KEY"],
        message: "Clerk publishable and secret keys must be configured together.",
      });
    }

    const hasAdminEmail = Boolean(value.ADMIN_EMAIL);
    const hasAdminHash = Boolean(value.ADMIN_PASSWORD_HASH);
    if (hasAdminEmail !== hasAdminHash) {
      ctx.addIssue({
        code: "custom",
        path: [hasAdminEmail ? "ADMIN_PASSWORD_HASH" : "ADMIN_EMAIL"],
        message: "Admin email and password hash must be configured together.",
      });
    }

    const cloudinaryValues = [
      value.CLOUDINARY_CLOUD_NAME,
      value.CLOUDINARY_API_KEY,
      value.CLOUDINARY_API_SECRET,
    ];
    const cloudinaryConfiguredCount = cloudinaryValues.filter(Boolean).length;
    if (cloudinaryConfiguredCount > 0 && cloudinaryConfiguredCount < cloudinaryValues.length) {
      ctx.addIssue({
        code: "custom",
        path: ["CLOUDINARY_CLOUD_NAME"],
        message: "Cloudinary cloud name, API key and API secret must be configured together.",
      });
    }

    const paytmValues = [value.PAYTM_MID, value.PAYTM_MERCHANT_KEY, value.PAYTM_WEBSITE_NAME, value.PAYTM_CALLBACK_URL];
    const paytmConfiguredCount = paytmValues.filter(Boolean).length;
    if (paytmConfiguredCount > 0 && paytmConfiguredCount < paytmValues.length) {
      ctx.addIssue({ code: "custom", path: ["PAYTM_MID"], message: "Paytm MID, merchant key, website name and callback URL must be configured together." });
    }
    if (value.PAYTM_ENV === "production" && value.PAYTM_CALLBACK_URL && !value.PAYTM_CALLBACK_URL.startsWith("https://")) {
      ctx.addIssue({ code: "custom", path: ["PAYTM_CALLBACK_URL"], message: "Production Paytm callbacks require HTTPS." });
    }

    const razorpayValues = [
      value.RAZORPAY_KEY_ID,
      value.RAZORPAY_KEY_SECRET,
      value.RAZORPAY_WEBHOOK_SECRET,
    ];
    const razorpayConfiguredCount = razorpayValues.filter(Boolean).length;
    if (razorpayConfiguredCount > 0 && razorpayConfiguredCount < razorpayValues.length) {
      ctx.addIssue({
        code: "custom",
        path: ["RAZORPAY_KEY_ID"],
        message: "Razorpay key id, key secret and webhook secret must be configured together.",
      });
    }

    const hasBrevoKey = Boolean(value.BREVO_API_KEY);
    const hasBrevoSender = Boolean(value.BREVO_SENDER_EMAIL);
    if (hasBrevoKey !== hasBrevoSender) {
      ctx.addIssue({
        code: "custom",
        path: [hasBrevoKey ? "BREVO_SENDER_EMAIL" : "BREVO_API_KEY"],
        message: "Brevo API key and verified sender email must be configured together.",
      });
    }
  });

/** Empty example-file fields mean "not configured", not invalid credentials. */
export function parseBackendEnv(input: Record<string, string | undefined>) {
  const normalized = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value.trim() !== ""),
  );
  return envSchema.safeParse(normalized);
}

const parsed = parseBackendEnv(process.env);

if (!parsed.success) {
  console.error("Invalid backend environment configuration", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid backend environment configuration");
}

export const env = parsed.data;
export const clerkConfigured = Boolean(env.CLERK_PUBLISHABLE_KEY && env.CLERK_SECRET_KEY);
export const adminAuthConfigured = Boolean(env.ADMIN_EMAIL && env.ADMIN_PASSWORD_HASH);
export const orderCreationEnabled = env.ORDER_CREATION_ENABLED === "true";
export const cloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);
export const razorpayConfigured = Boolean(
  env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && env.RAZORPAY_WEBHOOK_SECRET,
);
export const brevoConfigured = Boolean(env.BREVO_API_KEY && env.BREVO_SENDER_EMAIL);

export const paytmConfigured = Boolean(env.PAYTM_MID && env.PAYTM_MERCHANT_KEY && env.PAYTM_WEBSITE_NAME && env.PAYTM_CALLBACK_URL);
export const configuredPaymentProvider = env.PAYMENT_PROVIDER === "PAYTM" ? paytmConfigured : razorpayConfigured;
