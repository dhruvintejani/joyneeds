import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError.js";

export const validateQuery = (schema: ZodType): RequestHandler => (req, res, next) => {
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) {
    next(new AppError(400, "INVALID_QUERY", "The request query is invalid."));
    return;
  }
  res.locals.validatedQuery = parsed.data;
  next();
};

export const validateParams = (schema: ZodType): RequestHandler => (req, res, next) => {
  const parsed = schema.safeParse(req.params);
  if (!parsed.success) {
    next(new AppError(400, "INVALID_PARAMS", "The request path is invalid."));
    return;
  }
  res.locals.validatedParams = parsed.data;
  next();
};
