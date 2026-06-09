import rateLimit from "express-rate-limit";
import { RATE_LIMIT } from "../constants/rateLimiter.js";
import { ERROR_CODES } from "../constants/errorCodes.js";

export const createPaymentLimiter = rateLimit({
  windowMs: RATE_LIMIT.CREATE_PAYMENT.WINDOW_MS,
  max: RATE_LIMIT.CREATE_PAYMENT.MAX,
  message: {
    message: "Too many requests. Try later",
    errorCode: ERROR_CODES.RATE_LIMIT_ERROR,
  },
});

export const verifyPaymentLimiter = rateLimit({
  windowMs: RATE_LIMIT.VERIFY_PAYMENT.WINDOW_MS,
  max: RATE_LIMIT.VERIFY_PAYMENT.MAX,
  message: {
    message: "Too many requests. Try later",
    errorCode: ERROR_CODES.RATE_LIMIT_ERROR,
  },
});