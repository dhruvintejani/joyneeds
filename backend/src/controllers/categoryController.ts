import type { RequestHandler } from "express";
import { listCategories } from "../services/categoryService.js";

export const listCategoriesController: RequestHandler = async (_req, res) => {
  res.json({ data: await listCategories() });
};
