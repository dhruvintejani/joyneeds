import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, "NOT_FOUND", `Route ${req.method} ${req.path} was not found`));
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const requestId = typeof res.locals.requestId === "string" ? res.locals.requestId : undefined;

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "The request data is invalid.",
        details: error.flatten().fieldErrors,
        requestId,
      },
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
        requestId,
      },
    });
    return;
  }

  logger.error("Unhandled request error", {
    requestId,
    method: req.method,
    path: req.originalUrl,
    errorName: error instanceof Error ? error.name : "UnknownError",
  });

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong while processing the request.",
      requestId,
    },
  });
};
