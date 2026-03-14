const router = require("express").Router();

const {
  paymentVerificationSchema,
  orderIdSchema,
} = require("./payment.schema");
const {
  createPaymentLimiter,
  verifyPaymentLimiter,
} = require("../../middlewares/rateLimiter.middleware");
const {
  verifyAuth,
  requireUser,
} = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validation.middleware");
const {
  createPaymentController,
  paymentSuccessController,
} = require("./payment.controller");

// User
router.post(
  "/payments/create",
  createPaymentLimiter,
  verifyAuth,
  requireUser,
  validate(orderIdSchema),
  createPaymentController,
);
router.post(
  "/payments/verify",
  verifyPaymentLimiter,
  verifyAuth,
  requireUser,
  validate(paymentVerificationSchema),
  paymentSuccessController,
);

module.exports = router;
