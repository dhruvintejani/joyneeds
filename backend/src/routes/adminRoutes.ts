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
  adminUpdateCategoryController,
  adminUpdateProductController,
} from "../controllers/adminCatalogController.js";
import {
  adminAuthSessionController,
  adminLoginController,
  adminLogoutController,
} from "../controllers/adminAuthController.js";
import { requireAdmin, requireAdminWriteOrigin } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validateRequest.js";
import {
  adminCategoryCreateSchema,
  adminCategoryUpdateSchema,
  adminIdParamsSchema,
  adminLoginSchema,
  adminProductCreateSchema,
  adminProductListQuerySchema,
  adminProductUpdateSchema,
} from "../validators/adminValidators.js";

export const adminRouter = Router();

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
});

adminRouter.post(
  "/auth/login",
  adminLoginLimiter,
  requireAdminWriteOrigin,
  validateBody(adminLoginSchema),
  adminLoginController,
);
adminRouter.get("/auth/session", requireAdmin, adminAuthSessionController);
adminRouter.post("/auth/logout", requireAdmin, requireAdminWriteOrigin, adminLogoutController);

adminRouter.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 180,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
adminRouter.use(requireAdmin);

adminRouter.get("/dashboard", adminDashboardController);
adminRouter.get("/products", validateQuery(adminProductListQuerySchema), adminListProductsController);
adminRouter.post(
  "/products",
  requireAdminWriteOrigin,
  validateBody(adminProductCreateSchema),
  adminCreateProductController,
);
adminRouter.patch(
  "/products/:id",
  requireAdminWriteOrigin,
  validateParams(adminIdParamsSchema),
  validateBody(adminProductUpdateSchema),
  adminUpdateProductController,
);
adminRouter.delete(
  "/products/:id",
  requireAdminWriteOrigin,
  validateParams(adminIdParamsSchema),
  adminArchiveProductController,
);

adminRouter.get("/categories", adminListCategoriesController);
adminRouter.post(
  "/categories",
  requireAdminWriteOrigin,
  validateBody(adminCategoryCreateSchema),
  adminCreateCategoryController,
);
adminRouter.patch(
  "/categories/:id",
  requireAdminWriteOrigin,
  validateParams(adminIdParamsSchema),
  validateBody(adminCategoryUpdateSchema),
  adminUpdateCategoryController,
);
adminRouter.delete(
  "/categories/:id",
  requireAdminWriteOrigin,
  validateParams(adminIdParamsSchema),
  adminArchiveCategoryController,
);
