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
  requireRole,
} = require("../../middlewares/auth.middleware");
const {
  createPaymentController,
  paymentSuccessController,
} = require("./payment.controller");
const { ROLES } = require("../../constants/roles");

// User routes
router.post(
  "/payments/create",
  createPaymentLimiter,
  verifyAuth,
  requireRole([ROLES.USER]),
  validate(orderIdSchema),
  createPaymentController,
);
router.post(
  "/payments/verify",
  verifyPaymentLimiter,
  verifyAuth,
  requireRole([ROLES.USER]),
  validate(paymentVerificationSchema),
  paymentSuccessController,
);

module.exports = router;
