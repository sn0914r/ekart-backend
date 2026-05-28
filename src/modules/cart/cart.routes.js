const router = require("express").Router();
const { validate } = require("../../middlewares/validation.middleware");
const {
  verifyAuth,
  requireRole,
} = require("../../middlewares/auth.middleware");
const { CartRequestSchema, AddToCartRequestSchema } = require("./cart.schema");
const C = require("./cart.controller");
const { ROLES } = require("../../constants/roles");

// User routes
router.get("/cart", verifyAuth, C.getCartController);
router.post(
  "/cart/add",
  verifyAuth,
  requireRole([ROLES.USER]),
  validate(AddToCartRequestSchema),
  C.addToCartController,
);
router.patch(
  "/cart/increase",
  verifyAuth,
  requireRole([ROLES.USER]),
  validate(CartRequestSchema),
  C.incQuantityController,
);
router.patch(
  "/cart/decrease",
  verifyAuth,
  requireRole([ROLES.USER]),
  validate(CartRequestSchema),
  C.decQuantityController,
);
router.delete(
  "/cart/remove/:id",
  verifyAuth,
  requireRole([ROLES.USER]),
  C.removeFromCartController,
);
router.delete(
  "/cart/clear",
  verifyAuth,
  requireRole([ROLES.USER]),
  C.clearCartController,
);

module.exports = router;
