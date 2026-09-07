import type { RequestHandler } from "express";
import { getHealthStatus } from "../services/healthService.js";

export const getHealth: RequestHandler = (_req, res) => {
  res.status(200).json({ data: getHealthStatus() });
};
