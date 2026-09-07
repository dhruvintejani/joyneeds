import { Router } from "express";
import { getProductController, listProductsController } from "../controllers/productController.js";
import { validateParams, validateQuery } from "../middleware/validateRequest.js";
import { productListQuerySchema, productSlugParamsSchema } from "../validators/productValidators.js";

export const productRouter = Router();

productRouter.get("/", validateQuery(productListQuerySchema), listProductsController);
productRouter.get("/:slug", validateParams(productSlugParamsSchema), getProductController);
