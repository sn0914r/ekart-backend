const {
  getOrdersController,
  createOrderController,
  updateOrderController,
  getOrderController,
} = require("../controllers/order.controller");
const {
  verifyAuth,
  requireUser,
  requireAdmin,
} = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validation.middleware");
const {
  createOrderSchema,
  updateOrderSchema,
  updateShippingStatusSchema,
} = require("../validation/order.schema");

const router = require("express").Router();

// User
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

// Admin
router.get("/admin/orders", verifyAuth, requireAdmin, getOrdersController);
router.patch(
  "/admin/orders/:id",
  verifyAuth,
  requireAdmin,
  validate(updateShippingStatusSchema),
  updateOrderController,
);
router.get("/admin/orders/:id", verifyAuth, requireAdmin, getOrderController);

module.exports = router;
