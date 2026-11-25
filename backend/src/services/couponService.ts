import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
export const couponCodeSchema = z.string().trim().toUpperCase().regex(/^[A-Z0-9][A-Z0-9_-]{2,29}$/);
export const couponSchema = z.object({
  code: couponCodeSchema, percentOff: z.number().int().min(1).max(90),
  minSubtotalPaise: z.number().int().min(0).max(100000000),
  active: z.boolean(), expiresAt: z.iso.datetime().nullable(),
});
export function calculateDiscount(subtotalPaise: number, coupon: { percentOff: number; minSubtotalPaise: number; active: boolean; expiresAt: Date | null }, now = new Date()) {
  if (!coupon.active || (coupon.expiresAt && coupon.expiresAt <= now) || subtotalPaise < coupon.minSubtotalPaise) throw new AppError(400, "COUPON_UNAVAILABLE", "This coupon is not available for your order.");
  return Math.floor(subtotalPaise * coupon.percentOff / 100);
}
export async function getCouponDiscount(code: string | undefined, subtotalPaise: number) {
  if (!code) return 0;
  const coupon = await prisma.coupon.findUnique({where:{code}});
  if (!coupon) throw new AppError(400, "COUPON_UNAVAILABLE", "This coupon is not available for your order.");
  return calculateDiscount(subtotalPaise,coupon);
}
