import type { RequestHandler } from "express";
import {
  archiveAdminCategory,
  archiveAdminProduct,
  createAdminCategory,
  createAdminProduct,
  getAdminDashboard,
  listAdminCategories,
  listAdminProducts,
  updateAdminCategory,
  updateAdminProduct,
} from "../services/adminCatalogService.js";
import type {
  AdminCategoryCreateBody,
  AdminCategoryUpdateBody,
  AdminIdParams,
  AdminProductCreateBody,
  AdminProductListQuery,
  AdminProductUpdateBody,
} from "../validators/adminValidators.js";

export const adminDashboardController: RequestHandler = async (_req, res) => {
  res.json({ data: await getAdminDashboard() });
};

export const adminListProductsController: RequestHandler = async (_req, res) => {
  res.json({ data: await listAdminProducts(res.locals.validatedQuery as AdminProductListQuery) });
};

export const adminCreateProductController: RequestHandler = async (_req, res) => {
  const product = await createAdminProduct(res.locals.validatedBody as AdminProductCreateBody);
  res.status(201).json({ data: product });
};

export const adminUpdateProductController: RequestHandler = async (_req, res) => {
  const { id } = res.locals.validatedParams as AdminIdParams;
  res.json({ data: await updateAdminProduct(id, res.locals.validatedBody as AdminProductUpdateBody) });
};

export const adminArchiveProductController: RequestHandler = async (_req, res) => {
  const { id } = res.locals.validatedParams as AdminIdParams;
  res.json({ data: await archiveAdminProduct(id) });
};

export const adminListCategoriesController: RequestHandler = async (_req, res) => {
  res.json({ data: await listAdminCategories() });
};

export const adminCreateCategoryController: RequestHandler = async (_req, res) => {
  const category = await createAdminCategory(res.locals.validatedBody as AdminCategoryCreateBody);
  res.status(201).json({ data: category });
};

export const adminUpdateCategoryController: RequestHandler = async (_req, res) => {
  const { id } = res.locals.validatedParams as AdminIdParams;
  res.json({ data: await updateAdminCategory(id, res.locals.validatedBody as AdminCategoryUpdateBody) });
};

export const adminArchiveCategoryController: RequestHandler = async (_req, res) => {
  const { id } = res.locals.validatedParams as AdminIdParams;
  res.json({ data: await archiveAdminCategory(id) });
};
