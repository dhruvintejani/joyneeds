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
import {
  adminGetOrderController,
  adminListOrdersController,
  adminUpdateOrderController,
} from "../controllers/adminOrderController.js";
import {
  adminAddProductImagesController,
  adminDeleteProductImageController,
  adminListProductImagesController,
  adminReplaceProductImageController,
} from "../controllers/adminProductImageController.js";
import { requireAdmin, requireAdminWriteOrigin } from "../middleware/auth.js";
import {
  uploadProductImages,
  uploadReplacementImage,
} from "../middleware/productImageUpload.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validateRequest.js";
import {
  adminCategoryCreateSchema,
  adminCategoryUpdateSchema,
  adminIdParamsSchema,
  adminLoginSchema,
  adminProductCreateSchema,
  adminProductImageParamsSchema,
  adminProductListQuerySchema,
  adminProductUpdateSchema,
} from "../validators/adminValidators.js";
import {
  adminOrderListQuerySchema,
  adminOrderParamsSchema,
  adminOrderUpdateSchema,
} from "../validators/orderValidators.js";

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

adminRouter.get("/orders", validateQuery(adminOrderListQuerySchema), adminListOrdersController);
adminRouter.get(
  "/orders/:id",
  validateParams(adminOrderParamsSchema),
  adminGetOrderController,
);
adminRouter.patch(
  "/orders/:id",
  requireAdminWriteOrigin,
  validateParams(adminOrderParamsSchema),
  validateBody(adminOrderUpdateSchema),
  adminUpdateOrderController,
);

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

adminRouter.get(
  "/products/:id/images",
  validateParams(adminIdParamsSchema),
  adminListProductImagesController,
);
adminRouter.post(
  "/products/:id/images",
  requireAdminWriteOrigin,
  validateParams(adminIdParamsSchema),
  uploadProductImages,
  adminAddProductImagesController,
);
adminRouter.post(
  "/products/:productId/images/:imageId/replace",
  requireAdminWriteOrigin,
  validateParams(adminProductImageParamsSchema),
  uploadReplacementImage,
  adminReplaceProductImageController,
);
adminRouter.delete(
  "/products/:productId/images/:imageId",
  requireAdminWriteOrigin,
  validateParams(adminProductImageParamsSchema),
  adminDeleteProductImageController,
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
