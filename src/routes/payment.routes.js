const express = require("express");

const { orderSchema } = require("../validation/order.schema");
const { cartItemsSchema } = require("../validation/product.schema");

const { verifyAuth, requireUser } = require("../middlewares/auth.middleware");
const { validateBody } = require("../middlewares/validation.middleware");

const {
  createPaymentController,
  paymentSuccessController,
} = require("../controllers/payment.controller");
const {
  createPaymentLimiter,
  verifyPaymentLimiter,
} = require("../middlewares/rateLimiter.middleware");

const router = express.Router();

router.post(
  "/create",
  createPaymentLimiter,
  verifyAuth,
  requireUser,
  validateBody(cartItemsSchema),
  createPaymentController,
);
router.post(
  "/verify",
  verifyPaymentLimiter,
  verifyAuth,
  requireUser,
  validateBody(orderSchema),
  paymentSuccessController,
);

module.exports = router;
