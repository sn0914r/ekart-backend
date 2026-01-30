const express = require("express");

const { paymentSchema } = require("../validation/order.schema");
const { OrderIdSchema } = require("../validation/product.schema");

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
  validateBody(OrderIdSchema),
  createPaymentController,
);
router.post(
  "/verify",
  verifyPaymentLimiter,
  verifyAuth,
  requireUser,
  validateBody(paymentSchema),
  paymentSuccessController,
);

module.exports = router;
