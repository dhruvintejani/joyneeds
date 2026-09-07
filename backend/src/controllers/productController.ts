import type { RequestHandler } from "express";
import { getProductBySlug, listProducts } from "../services/productService.js";
import type { ProductListQuery, ProductSlugParams } from "../validators/productValidators.js";

export const listProductsController: RequestHandler = async (_req, res) => {
  const query = res.locals.validatedQuery as ProductListQuery;
  res.json({ data: await listProducts(query) });
};

export const getProductController: RequestHandler = async (_req, res) => {
  const { slug } = res.locals.validatedParams as ProductSlugParams;
  res.json({ data: await getProductBySlug(slug) });
};
