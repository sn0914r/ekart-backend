import { Router } from "express";
import { rateLimiter } from "../../middlewares/rateLimiter.middleware.js";
import {
  authenticate,
  requireRole,
} from "../../middlewares/auth.middleware.js";
import { ROLES } from "../../constants/roles.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { orderIdSchema, paymentVerificationSchema } from "./payment.schema.js";
import {
  createPaymentController,
  paymentSuccessController,
} from "./payment.controller.js";
import { RATE_LIMIT } from "../../constants/rateLimiter.js";

export const paymentRouter = Router();

paymentRouter.post(
  "/payments/create",
  rateLimiter(
    RATE_LIMIT.CREATE_PAYMENT.MAX,
    RATE_LIMIT.CREATE_PAYMENT.ROUTE,
    RATE_LIMIT.CREATE_PAYMENT.WINDOW_MS,
  ),
  authenticate,
  requireRole([ROLES.USER]),
  validate(orderIdSchema),
  createPaymentController,
);

paymentRouter.post(
  "/payments/verify",
  rateLimiter(
    RATE_LIMIT.VERIFY_PAYMENT.MAX,
    RATE_LIMIT.VERIFY_PAYMENT.ROUTE,
    RATE_LIMIT.VERIFY_PAYMENT.WINDOW_MS,
  ),
  authenticate,
  requireRole([ROLES.USER]),
  validate(paymentVerificationSchema),
  paymentSuccessController,
);
