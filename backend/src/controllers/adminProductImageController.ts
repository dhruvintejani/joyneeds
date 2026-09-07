import type { RequestHandler } from "express";
import {
  addProductImages,
  deleteProductImage,
  listProductImages,
  replaceProductImage,
} from "../services/productImageService.js";

type ProductParams = { id: string };
type ProductImageParams = { productId: string; imageId: string };

export const adminListProductImagesController: RequestHandler = async (_req, res) => {
  const { id } = res.locals.validatedParams as ProductParams;
  res.json({ data: await listProductImages(id) });
};

export const adminAddProductImagesController: RequestHandler = async (req, res) => {
  const { id } = res.locals.validatedParams as ProductParams;
  const files = Array.isArray(req.files) ? req.files : [];
  const images = await addProductImages(id, files);
  res.status(201).json({ data: images });
};

export const adminReplaceProductImageController: RequestHandler = async (req, res) => {
  const { productId, imageId } = res.locals.validatedParams as ProductImageParams;
  const images = await replaceProductImage(productId, imageId, req.file);
  res.json({ data: images });
};

export const adminDeleteProductImageController: RequestHandler = async (_req, res) => {
  const { productId, imageId } = res.locals.validatedParams as ProductImageParams;
  const images = await deleteProductImage(productId, imageId);
  res.json({ data: images });
};
