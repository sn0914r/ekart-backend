import { Router } from "express";
import { authenticate, requireRole } from "#middlewares/auth.middleware.js";
import { validate } from "#middlewares/validation.middleware.js";
import { ROLES } from "#constants/index.js";
import { CartController } from "./cart.controller.js";
import {
  AddToCartSchema,
  CartItemProductIdSchema,
  RemoveCartItemParamSchema,
} from "./cart.schema.js";

export const cartRouter = Router();

cartRouter.get(
  "/cart",
  authenticate,
  requireRole([ROLES.USER]),
  CartController.getCart,
);

cartRouter.post(
  "/cart/add",
  authenticate,
  requireRole([ROLES.USER]),
  validate(AddToCartSchema),
  CartController.addProductToCart,
);

cartRouter.patch(
  "/cart/increase",
  authenticate,
  requireRole([ROLES.USER]),
  validate(CartItemProductIdSchema),
  CartController.increaseProductQuantity,
);

cartRouter.patch(
  "/cart/decrease",
  authenticate,
  requireRole([ROLES.USER]),
  validate(CartItemProductIdSchema),
  CartController.decreaseProductQuantity,
);

cartRouter.delete(
  "/cart/remove/:id",
  authenticate,
  requireRole([ROLES.USER]),
  validate(RemoveCartItemParamSchema, "params"),
  CartController.removeProductFromCart,
);

cartRouter.delete(
  "/cart/clear",
  authenticate,
  requireRole([ROLES.USER]),
  CartController.clearCart,
);
