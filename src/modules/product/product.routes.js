import { Router } from "express";
import { authenticate, requireRole } from "#middlewares/auth.middleware.js";
import { upload } from "#middlewares/upload.middleware.js";
import { validate, validateFile } from "#middlewares/validation.middleware.js";
import { parseJsonFields } from "#middlewares/parseJsonFields.middleware.js";
import { ROLES } from "#constants/index.js";
import { ProductController } from "./product.controller.js";
import {
  addProductSchema,
  updateProductSchema,
  productIdParamSchema,
  productColorQuerySchema,
} from "./product.schema.js";

export const productsRouter = Router();

// INFO: Customer Catalog Routes
productsRouter.get("/products", ProductController.getActiveProducts);

productsRouter.get("/products/meta", ProductController.getProductMeta);

productsRouter.get(
  "/products/colors",
  validate(productColorQuerySchema, "query"),
  ProductController.getProductColors,
);

productsRouter.get(
  "/products/:id",
  validate(productIdParamSchema, "params"),
  ProductController.getActiveProductDetails,
);

// INFO: Admin Management Routes
productsRouter.get(
  "/admin/products",
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.DEMO_ADMIN]),
  ProductController.adminGetProductsList,
);

productsRouter.get(
  "/admin/products/:id",
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.DEMO_ADMIN]),
  validate(productIdParamSchema, "params"),
  ProductController.adminGetProductById,
);

productsRouter.post(
  "/admin/products",
  authenticate,
  requireRole([ROLES.ADMIN]),
  upload,
  validateFile,
  parseJsonFields("data"),
  validate(addProductSchema),
  ProductController.adminAddProduct,
);

productsRouter.patch(
  "/admin/products/:id",
  authenticate,
  requireRole([ROLES.ADMIN]),
  validate(productIdParamSchema, "params"),
  validate(updateProductSchema),
  ProductController.adminUpdateProduct,
);

productsRouter.delete(
  "/admin/products/:id",
  authenticate,
  requireRole([ROLES.ADMIN]),
  validate(productIdParamSchema, "params"),
  ProductController.adminDeleteProduct,
);
