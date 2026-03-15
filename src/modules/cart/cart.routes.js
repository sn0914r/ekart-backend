const { verifyAuth } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validation.middleware");
const CartController = require("./cart.controller");
const CartSchema = require("./cart.schema");

const router = require("express").Router();

router.put(
  "/cart",
  verifyAuth,
  validate(CartSchema, "body"),
  CartController.updateCartController,
);

router.get("/cart", verifyAuth, CartController.getCartController);
module.exports = router;
