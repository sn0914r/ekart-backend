const express = require("express");

const { updateOrderSchema } = require("../validation/order.schema");
const {
  addProductSchema,
  updateProductSchema,
} = require("../validation/product.schema");

const { verifyAuth, requireAdmin } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const {
  validateFile,
  validateBody,
} = require("../middlewares/validation.middleware");
const parseMultipartJson = require("../middlewares/parseMultipartJSON.middleware");

const {
  addProductController,
  updateProductController,
} = require("../controllers/product.controller");
const {
  getOrdersForAdminController,
  updateOrderController,
} = require("../controllers/order.controller");

const router = express.Router();

router.get("/orders", verifyAuth, requireAdmin, getOrdersForAdminController);
router.post(
  "/products",
  verifyAuth,
  requireAdmin,
  upload,
  validateFile,
  parseMultipartJson,
  validateBody(addProductSchema),
  addProductController
);
router.patch(
  "/orders/:id",
  verifyAuth,
  requireAdmin,
  validateBody(updateOrderSchema),
  updateOrderController
);
router.patch(
  "/products/:id",
  verifyAuth,
  requireAdmin,
  validateBody(updateProductSchema),
  updateProductController
);

module.exports = router;
