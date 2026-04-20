const router = require("express").Router();
const {
  getOrdersController,
  createOrderController,
  updateOrderController,
  getOrdersForAdminController,
  getOrderForAdminController,
} = require("./order.controller");
const {
  verifyAuth,
  requireUser,
  requireAdmin,
} = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validation.middleware");
const {
  createOrderSchema,
  updateOrderSchema,
  updateShippingStatusSchema,
} = require("./order.schema");

// User routes
router.get("/orders", verifyAuth, requireUser, getOrdersController);
router.post(
  "/orders",
  verifyAuth,
  requireUser,
  validate(createOrderSchema),
  createOrderController,
);
router.patch(
  "/orders/:id",
  verifyAuth,
  requireUser,
  validate(updateOrderSchema),
  updateOrderController,
);

// Admin routes
router.get(
  "/admin/orders",
  verifyAuth,
  requireAdmin,
  getOrdersForAdminController,
);
router.patch(
  "/admin/orders/:id",
  verifyAuth,
  requireAdmin,
  validate(updateShippingStatusSchema),
  updateOrderController,
);
router.get(
  "/admin/orders/:id",
  verifyAuth,
  requireAdmin,
  getOrderForAdminController,
);

module.exports = router;
