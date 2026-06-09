import { Router } from "express";
import {
  authenticate,
  requireRole,
} from "../../../middlewares/auth.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import {
  addProductByAdminController,
  deleteProductByAdminController,
  getProductForAdminController,
  getProductsForAdminController,
  updateProductByAdminController,
} from "../controllers/admin.controller.js";
import { upload } from "../../../middlewares/upload.middleware.js";
import {
  validate,
  validateFile,
} from "../../../middlewares/validation.middleware.js";
import { parseJsonFields } from "../../../middlewares/parseJsonFields.middleware.js";
import { addProductSchema, updateProductSchema } from "../product.schema.js";

export const adminProductRoutes = Router();

adminProductRoutes.get(
  "/admin/products",
  authenticate,
  requireRole([ROLES.ADMIN]),
  getProductsForAdminController,
);

adminProductRoutes.get(
  "/admin/products/:id",
  authenticate,
  requireRole([ROLES.ADMIN]),
  getProductForAdminController,
);

adminProductRoutes.post(
  "/admin/products",
  authenticate,
  requireRole([ROLES.ADMIN]),
  upload,
  validateFile,
  parseJsonFields("data"),
  validate(addProductSchema),
  addProductByAdminController,
);

adminProductRoutes.patch(
  "/admin/products/:id",
  authenticate,
  requireRole([ROLES.ADMIN]),
  validate(updateProductSchema),
  updateProductByAdminController,
);

adminProductRoutes.delete(
  "/admin/products/:id",
  authenticate,
  requireRole([ROLES.ADMIN]),
  deleteProductByAdminController,
);
