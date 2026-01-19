const rateLimit = require("express-rate-limit");

const createPaymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 4,
  message: { message: "Too many payment requests. Try later" },
});

const verifyPaymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { message: "Too many verification requests. Try later" },
});

module.exports = { createPaymentLimiter, verifyPaymentLimiter };
