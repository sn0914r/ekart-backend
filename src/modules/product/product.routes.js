const router = require("express").Router();
const {
  verifyAuth,
  requireAdmin,
} = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");
const {
  validateFile,
  validate,
} = require("../../middlewares/validation.middleware");
const parseJsonFields = require("../../middlewares/parseJsonFields.middleware");
const {
  getProductsForAdminController,
  addProductByAdminController,
  updateProductByAdminController,
  deleteProductByAdminController,
  getProductForAdminController,
  getActiveProductsController,
} = require("./product.controller");
const { addProductSchema, updateProductSchema } = require("./product.schema");

// Public routes
router.get("/products", getActiveProductsController);

// Admin routes
router.get(
  "/admin/products",
  verifyAuth,
  requireAdmin,
  getProductsForAdminController,
);
router.post(
  "/admin/products",
  verifyAuth,
  requireAdmin,
  upload,
  validateFile,
  parseJsonFields("data"),
  validate(addProductSchema),
  addProductByAdminController,
);
router.patch(
  "/admin/products/:id",
  verifyAuth,
  requireAdmin,
  validate(updateProductSchema),
  updateProductByAdminController,
);
router.delete(
  "/admin/products/:id",
  verifyAuth,
  requireAdmin,
  deleteProductByAdminController,
);
router.get(
  "/admin/products/:id",
  verifyAuth,
  requireAdmin,
  getProductForAdminController,
);

module.exports = router;
