import type { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { env, orderCreationEnabled, configuredPaymentProvider, paytmConfigured, razorpayConfigured } from "../config/env.js";
import type { Prisma } from "../generated/prisma/client.js";
export const paymentListQuery = z.object({
  q: z.string().trim().max(100).optional(), page: z.coerce.number().int().min(1).max(100000).default(1),
  provider: z.enum(["ALL","PAYTM","RAZORPAY"]).default("ALL"),
  status: z.enum(["ALL","CREATED","PENDING","PAID","FAILED","REFUNDED","PARTIALLY_REFUNDED"]).default("ALL"),
});
export const listPayments: RequestHandler = async (_req,res) => {
  const { q,page,provider,status } = res.locals.validatedQuery as z.infer<typeof paymentListQuery>;
  const where: Prisma.PaymentWhereInput = {
    ...(provider !== "ALL" ? { provider } : {}),
    ...(status !== "ALL" ? { status } : {}),
    ...(q ? { OR: [{ order: { orderNumber: { contains: q, mode: "insensitive" } } }, { providerPaymentId: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const limit = 25;
  const [items,total,paid,pendingCount] = await Promise.all([
    prisma.payment.findMany({ where, skip:(page-1)*limit, take:limit, orderBy:[{createdAt:"desc"},{id:"desc"}], select:{id:true,provider:true,status:true,amountPaise:true,refundedAmountPaise:true,currency:true,providerPaymentId:true,createdAt:true,order:{select:{id:true,orderNumber:true}}} }),
    prisma.payment.count({where}),
    prisma.payment.aggregate({where:{status:{in:["PAID","PARTIALLY_REFUNDED","REFUNDED"]}},_sum:{amountPaise:true,refundedAmountPaise:true}}),
    prisma.payment.count({where:{status:{in:["CREATED","PENDING"]}}}),
  ]);
  res.set("Cache-Control","no-store").json({data:{items,pagination:{page,limit,total,pages:Math.max(1,Math.ceil(total/limit))},summary:{paidPaise:paid._sum.amountPaise??0,refundedPaise:paid._sum.refundedAmountPaise??0,pendingCount},configuration:{provider:env.PAYMENT_PROVIDER,checkoutEnabled:orderCreationEnabled&&configuredPaymentProvider,paytmConfigured,razorpayConfigured}}});
};
