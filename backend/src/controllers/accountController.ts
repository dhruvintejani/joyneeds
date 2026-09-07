import type { RequestHandler } from "express";
import { syncCustomerAccount } from "../services/accountService.js";

export const getAccountController: RequestHandler = async (_req, res) => {
  const clerkUserId = res.locals.clerkUserId as string;
  res.json({ data: await syncCustomerAccount(clerkUserId) });
};
