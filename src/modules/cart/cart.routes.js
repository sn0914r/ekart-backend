const router = require("express").Router();
const { validate } = require("../../middlewares/validation.middleware");
const { verifyAuth } = require("../../middlewares/auth.middleware");
const { CartSchema } = require("./cart.schema");
const {
  getCartController,
  updateCartController,
} = require("./cart.controller");

// User routes
router.get("/cart", verifyAuth, getCartController);
router.put(
  "/cart",
  verifyAuth,
  validate(CartSchema, "body"),
  updateCartController,
);

module.exports = router;
