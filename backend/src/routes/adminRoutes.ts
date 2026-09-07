import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  adminArchiveCategoryController,
  adminArchiveProductController,
  adminCreateCategoryController,
  adminCreateProductController,
  adminDashboardController,
  adminListCategoriesController,
  adminListProductsController,
  adminSessionController,
  adminUpdateCategoryController,
  adminUpdateProductController,
} from "../controllers/adminCatalogController.js";
import { requireAdmin } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validateRequest.js";
import {
  adminCategoryCreateSchema,
  adminCategoryUpdateSchema,
  adminIdParamsSchema,
  adminProductCreateSchema,
  adminProductListQuerySchema,
  adminProductUpdateSchema,
} from "../validators/adminValidators.js";

export const adminRouter = Router();

adminRouter.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
adminRouter.use(requireAdmin);

adminRouter.get("/session", adminSessionController);
adminRouter.get("/dashboard", adminDashboardController);

adminRouter.get("/products", validateQuery(adminProductListQuerySchema), adminListProductsController);
adminRouter.post("/products", validateBody(adminProductCreateSchema), adminCreateProductController);
adminRouter.patch(
  "/products/:id",
  validateParams(adminIdParamsSchema),
  validateBody(adminProductUpdateSchema),
  adminUpdateProductController,
);
adminRouter.delete(
  "/products/:id",
  validateParams(adminIdParamsSchema),
  adminArchiveProductController,
);

adminRouter.get("/categories", adminListCategoriesController);
adminRouter.post("/categories", validateBody(adminCategoryCreateSchema), adminCreateCategoryController);
adminRouter.patch(
  "/categories/:id",
  validateParams(adminIdParamsSchema),
  validateBody(adminCategoryUpdateSchema),
  adminUpdateCategoryController,
);
adminRouter.delete(
  "/categories/:id",
  validateParams(adminIdParamsSchema),
  adminArchiveCategoryController,
);
