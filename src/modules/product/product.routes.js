const router = require("express").Router();
const {
  verifyAuth,
  requireRole,
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
  getActiveProductDetailsController,
  getAvailableColorsOptionsByProductNameController,
} = require("./product.controller");
const { addProductSchema, updateProductSchema } = require("./product.schema");
const { ROLES } = require("../../constants/roles");

// Public routes
router.get("/products", getActiveProductsController);
router.get(
  "/products/colors",
  getAvailableColorsOptionsByProductNameController,
);
router.get("/products/:id", getActiveProductDetailsController);

// Admin routes
router.get(
  "/admin/products",
  verifyAuth,
  requireRole([ROLES.ADMIN]),
  getProductsForAdminController,
);
router.post(
  "/admin/products",
  verifyAuth,
  requireRole([ROLES.ADMIN]),
  upload,
  validateFile,
  parseJsonFields("data"),
  validate(addProductSchema),
  addProductByAdminController,
);
router.patch(
  "/admin/products/:id",
  verifyAuth,
  requireRole([ROLES.ADMIN]),
  validate(updateProductSchema),
  updateProductByAdminController,
);
router.delete(
  "/admin/products/:id",
  verifyAuth,
  requireRole([ROLES.ADMIN]),
  deleteProductByAdminController,
);
router.get(
  "/admin/products/:id",
  verifyAuth,
  requireRole([ROLES.ADMIN]),
  getProductForAdminController,
);

module.exports = router;
