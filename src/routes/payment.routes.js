const router = require("express").Router();

const { paymentVerificationSchema, orderIdSchema } = require("../validation/payment.schema");
const { createPaymentLimiter, verifyPaymentLimiter } = require("../middlewares/rateLimiter.middleware");
const { verifyAuth, requireUser } = require("../middlewares/auth.middleware");
const { validateBody } = require("../middlewares/validation.middleware");
const { createPaymentController, paymentSuccessController } = require("../controllers/payment.controller");

// User
router.post("/payments/create", createPaymentLimiter, verifyAuth, requireUser, validateBody(orderIdSchema), createPaymentController);
router.post("/payments/verify", verifyPaymentLimiter, verifyAuth, requireUser, validateBody(paymentVerificationSchema), paymentSuccessController);

module.exports = router;
