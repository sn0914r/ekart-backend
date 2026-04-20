const router = require("express").Router();
const { validate } = require("../../middlewares/validation.middleware");
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
const {
  createPaymentController,
  paymentSuccessController,
} = require("./payment.controller");

// User routes
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
