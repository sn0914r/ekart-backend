import { Router } from "express";
import { authenticate, requireRole } from "#middlewares/auth.middleware.js";
import { validate } from "#middlewares/validation.middleware.js";
import { ROLES } from "#constants/index.js";
import {
  addToCartController,
  clearCartController,
  decQuantityController,
  getCartController,
  incQuantityController,
  removeFromCartController,
} from "./cart.controller.js";
import { AddToCartSchema, CartItemProductIdSchema } from "./cart.schema.js";

export const cartRouter = Router();

cartRouter.get(
  "/cart",
  authenticate,
  requireRole([ROLES.USER]),
  getCartController,
);

cartRouter.post(
  "/cart/add",
  authenticate,
  requireRole([ROLES.USER]),
  validate(AddToCartSchema),
  addToCartController,
);

cartRouter.patch(
  "/cart/increase",
  authenticate,
  requireRole([ROLES.USER]),
  validate(CartItemProductIdSchema),
  incQuantityController,
);
cartRouter.patch(
  "/cart/decrease",
  authenticate,
  requireRole([ROLES.USER]),
  validate(CartItemProductIdSchema),
  decQuantityController,
);
cartRouter.delete(
  "/cart/remove/:id",
  authenticate,
  requireRole([ROLES.USER]),
  removeFromCartController,
);
cartRouter.delete(
  "/cart/clear",
  authenticate,
  requireRole([ROLES.USER]),
  clearCartController,
);
