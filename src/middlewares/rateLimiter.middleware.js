const rateLimit = require("express-rate-limit");
const { RATE_LIMIT } = require("../constants/rateLimiter");
const { ERROR_CODES } = require("../constants/errorCodes");

/**
 * Rate limiter for creating payments
 *
 * @throws {429, ERROR_CODES.RATE_LIMIT_ERROR} If the rate limit is exceeded
 */
const createPaymentLimiter = rateLimit({
  windowMs: RATE_LIMIT.CREATE_PAYMENT.WINDOW_MS,
  max: RATE_LIMIT.CREATE_PAYMENT.MAX,
  message: {
    message: "Too many requests. Try later",
    errorCode: ERROR_CODES.RATE_LIMIT_ERROR,
  },
});

/**
 * Rate limiter for verifying payments
 *
 * @throws {429, ERROR_CODES.RATE_LIMIT_ERROR} If the rate limit is exceeded
 */
const verifyPaymentLimiter = rateLimit({
  windowMs: RATE_LIMIT.VERIFY_PAYMENT.WINDOW_MS,
  max: RATE_LIMIT.VERIFY_PAYMENT.MAX,
  message: {
    message: "Too many requests. Try later",
    errorCode: ERROR_CODES.RATE_LIMIT_ERROR,
  },
});

module.exports = { createPaymentLimiter, verifyPaymentLimiter };
