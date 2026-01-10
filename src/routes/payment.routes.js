const express = require("express");

const { orderSchema } = require("../validation/order.schema");
const { cartItemsSchema } = require("../validation/product.schema");

const { verifyAuth, requireUser } = require("../middlewares/auth.middleware");
const { validateBody } = require("../middlewares/validation.middleware");

const {
  createPaymentController,
  paymentSuccessController,
} = require("../controllers/payment.controller");

const router = express.Router();

router.post(
  "/create-payment",
  verifyAuth,
  requireUser,
  validateBody(cartItemsSchema),
  createPaymentController
);
router.post(
  "/verify-payment",
  verifyAuth,
  requireUser,
  validateBody(orderSchema),
  paymentSuccessController
);

module.exports = router;
