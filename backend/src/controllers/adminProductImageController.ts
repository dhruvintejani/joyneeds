import type { RequestHandler } from "express";
import {
  addProductImages,
  deleteProductImage,
  listProductImages,
  replaceProductImage,
} from "../services/productImageService.js";

export const adminListProductImagesController: RequestHandler = async (req, res) => {
  res.json({ data: await listProductImages(req.params.id) });
};

export const adminAddProductImagesController: RequestHandler = async (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];
  const images = await addProductImages(req.params.id, files);
  res.status(201).json({ data: images });
};

export const adminReplaceProductImageController: RequestHandler = async (req, res) => {
  const images = await replaceProductImage(req.params.productId, req.params.imageId, req.file);
  res.json({ data: images });
};

export const adminDeleteProductImageController: RequestHandler = async (req, res) => {
  const images = await deleteProductImage(req.params.productId, req.params.imageId);
  res.json({ data: images });
};
