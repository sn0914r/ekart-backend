const router = require("express").Router();
const { validate } = require("../../middlewares/validation.middleware");
const { verifyAuth } = require("../../middlewares/auth.middleware");
const { CartRequestSchema, AddToCartRequestSchema } = require("./cart.schema");
const C = require("./cart.controller");

// User routes
router.get("/cart", verifyAuth, C.getCartController);
router.post(
  "/cart/add",
  verifyAuth,
  validate(AddToCartRequestSchema),
  C.addToCartController,
);
router.patch(
  "/cart/increase",
  verifyAuth,
  validate(CartRequestSchema),
  C.incQuantityController,
);
router.patch(
  "/cart/decrease",
  verifyAuth,
  validate(CartRequestSchema),
  C.decQuantityController,
);
router.delete("/cart/remove/:id", verifyAuth, C.removeFromCartController);
router.delete("/cart/clear", verifyAuth, C.clearCartController);

module.exports = router;
