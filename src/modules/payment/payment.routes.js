import { Router } from "express";
import { rateLimiter } from "#middlewares/rateLimiter.middleware.js";
import { authenticate, requireRole } from "#middlewares/auth.middleware.js";
import { validate } from "#middlewares/validation.middleware.js";
import { ROLES, RATE_LIMIT } from "#constants/index.js";
import { initiatePaymentSchema } from "./payment.schema.js";
import {
  initiatePaymentController,
  verifyPaymentController,
} from "./payment.controller.js";
import { verifyPOESignature } from "./payment.middleware.js";

export const paymentRouter = Router();

paymentRouter.post(
  "/payments/initiate",
  rateLimiter(
    RATE_LIMIT.CREATE_PAYMENT.MAX,
    RATE_LIMIT.CREATE_PAYMENT.ROUTE,
    RATE_LIMIT.CREATE_PAYMENT.WINDOW_MS,
  ),
  authenticate,
  requireRole([ROLES.USER]),
  validate(initiatePaymentSchema),
  initiatePaymentController,
);

paymentRouter.post(
  "/payments/webhook/verify",
  verifyPOESignature,
  verifyPaymentController,
);
