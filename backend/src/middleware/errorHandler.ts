import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, "NOT_FOUND", `Route ${req.method} ${req.path} was not found`));
};

type BodyParserError = Error & {
  status?: number;
  statusCode?: number;
  type?: string;
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

  const parserError = error as BodyParserError;
  if (parserError.type === "entity.too.large" || parserError.status === 413 || parserError.statusCode === 413) {
    res.status(413).json({
      error: {
        code: "BODY_TOO_LARGE",
        message: "The request body is too large.",
        requestId,
      },
    });
    return;
  }

  if (parserError.type === "entity.parse.failed" && error instanceof SyntaxError) {
    res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "The request body contains invalid JSON.",
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
