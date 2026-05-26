const router = require("express").Router();
const {
  getOrdersController,
  createOrderController,
  updateOrderController,
  getOrdersForAdminController,
  getOrderForAdminController,
  updateOrderByAdminController,
  getOrderController,
} = require("./order.controller");
const {
  verifyAuth,
  requireRole,
} = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validation.middleware");
const {
  createOrderSchema,
  updateOrderSchema,
  updateShippingStatusSchema,
} = require("./order.schema");
const { ROLES } = require("../../constants/roles");

// User routes
router.get(
  "/orders",
  verifyAuth,
  requireRole([ROLES.USER]),
  getOrdersController,
);
router.post(
  "/orders",
  verifyAuth,
  requireRole([ROLES.USER]),
  validate(createOrderSchema),
  createOrderController,
);
router.patch(
  "/orders/:id",
  verifyAuth,
  requireRole([ROLES.USER]),
  validate(updateOrderSchema),
  updateOrderController,
);
router.get(
  "/orders/:id",
  verifyAuth,
  requireRole([ROLES.USER]),
  getOrderController,
);

// Admin routes
router.get(
  "/admin/orders",
  verifyAuth,
  requireRole([ROLES.ADMIN]),
  getOrdersForAdminController,
);
router.patch(
  "/admin/orders/:id",
  verifyAuth,
  requireRole([ROLES.ADMIN]),
  validate(updateShippingStatusSchema),
  updateOrderByAdminController,
);
router.get(
  "/admin/orders/:id",
  verifyAuth,
  requireRole([ROLES.ADMIN]),
  getOrderForAdminController,
);

module.exports = router;
