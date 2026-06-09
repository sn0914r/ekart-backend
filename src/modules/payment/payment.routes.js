import { Router } from "express";
import {
  createPaymentLimiter,
  verifyPaymentLimiter,
} from "../../middlewares/rateLimiter.middleware.js";
import { authenticate, requireRole } from "../../middlewares/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { orderIdSchema, paymentVerificationSchema } from "./payment.schema.js";
import {
  createPaymentController,
  paymentSuccessController,
} from "./payment.controller.js";

export const paymentRouter = Router();

paymentRouter.post(
  "/payments/create",
  createPaymentLimiter,
  authenticate,
  requireRole([ROLES.USER]),
  validate(orderIdSchema),
  createPaymentController,
);

paymentRouter.post(
  "/payments/verify",
  verifyPaymentLimiter,
  authenticate,
  requireRole([ROLES.USER]),
  validate(paymentVerificationSchema),
  paymentSuccessController,
);
