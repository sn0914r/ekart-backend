const express = require("express");

const createPaymentOrder = require("../controllers/createPaymentOrder.controller");
const verifyPaymentOrder = require("../controllers/verifyPaymentOrder.controller");

const validate = require("../middlewares/validate.middleware");

const OrderSchema = require("../schemas/order.schema");
const ProductItems = require("../schemas/productItems.schema");
const verifyAuth = require("../middlewares/verifyAuth.middleware");

const router = express.Router();

router.post(
  "/create-payment",
  verifyAuth,
  validate(ProductItems),
  createPaymentOrder
);
router.post(
  "/verify-payment",
  verifyAuth,
  validate(OrderSchema),
  verifyPaymentOrder
);

module.exports = router;
