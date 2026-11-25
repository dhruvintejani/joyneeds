import type { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../utils/AppError.js";

export const customerListQuery = z.object({
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
const selectCustomer = {
  id: true, firstName: true, lastName: true, email: true, createdAt: true,
  _count: { select: { orders: true } },
} satisfies Prisma.UserSelect;

export const listCustomers: RequestHandler = async (_req, res) => {
  const { q, page, limit } = res.locals.validatedQuery as z.infer<typeof customerListQuery>;
  const where: Prisma.UserWhereInput = q ? { OR: [
    { firstName: { contains: q, mode: "insensitive" } },
    { lastName: { contains: q, mode: "insensitive" } },
    { email: { contains: q, mode: "insensitive" } },
  ] } : {};
  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, select: selectCustomer, skip: (page - 1) * limit, take: limit, orderBy: [{ createdAt: "desc" }, { id: "desc" }] }),
  ]);
  res.set("Cache-Control", "no-store").json({ data: { items, pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } } });
};

export const getCustomer: RequestHandler = async (_req, res) => {
  const { id } = res.locals.validatedParams as { id: string };
  const customer = await prisma.user.findUnique({
    where: { id },
    select: { ...selectCustomer, orders: { take: 50, orderBy: { createdAt: "desc" }, select: {
      id: true, orderNumber: true, status: true, totalPaise: true, createdAt: true,
    } } },
  });
  if (!customer) throw new AppError(404, "CUSTOMER_NOT_FOUND", "Customer not found.");
  res.set("Cache-Control", "no-store").json({ data: customer });
};
