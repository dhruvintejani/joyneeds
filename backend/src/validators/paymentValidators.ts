import { z } from "zod";

const idSchema = z.string().trim().min(1).max(100);

export const createRazorpayOrderSchema = z.object({
  orderId: idSchema,
});
export type CreateRazorpayOrderBody = z.infer<typeof createRazorpayOrderSchema>;

export const verifyRazorpayPaymentSchema = z.object({
  paymentId: idSchema,
  razorpayPaymentId: z.string().trim().min(4).max(120),
  razorpayOrderId: z.string().trim().min(4).max(120),
  razorpaySignature: z.string().trim().regex(/^[a-f0-9]{64}$/i, "Invalid Razorpay signature."),
});
export type VerifyRazorpayPaymentBody = z.infer<typeof verifyRazorpayPaymentSchema>;

export const adminRefundSchema = z.object({
  amountPaise: z.coerce.number().int().min(1).max(100_000_000).optional(),
  reason: z.string().trim().max(250).optional(),
});
export type AdminRefundBody = z.infer<typeof adminRefundSchema>;
