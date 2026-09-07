import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError.js";

function validate(schema: ZodType, value: unknown, code: string, message: string) {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new AppError(400, code, message);
  return parsed.data;
}

export const validateQuery = (schema: ZodType): RequestHandler => (req, res, next) => {
  try {
    res.locals.validatedQuery = validate(schema, req.query, "INVALID_QUERY", "The request query is invalid.");
    next();
  } catch (error) {
    next(error);
  }
};

export const validateParams = (schema: ZodType): RequestHandler => (req, res, next) => {
  try {
    res.locals.validatedParams = validate(schema, req.params, "INVALID_PARAMS", "The request path is invalid.");
    next();
  } catch (error) {
    next(error);
  }
};

export const validateBody = (schema: ZodType): RequestHandler => (req, res, next) => {
  try {
    res.locals.validatedBody = validate(schema, req.body, "INVALID_BODY", "The request body is invalid.");
    next();
  } catch (error) {
    next(error);
  }
};
