import { Router } from "express";
import { ROLES } from "#constants/index.js";
import { authenticate, requireRole } from "#middlewares/auth.middleware.js";
import { validate } from "#middlewares/validation.middleware.js";
import { WishlistController } from "./wishlist.controller.js";
import {
  addWishlistItemSchema,
  wishlistItemParamSchema,
} from "./wishlist.schemas.js";

export const wishlistRouter = Router();

wishlistRouter.get(
  "/wishlist",
  authenticate,
  requireRole([ROLES.USER]),
  WishlistController.getWishlist,
);

wishlistRouter.post(
  "/wishlist",
  authenticate,
  requireRole([ROLES.USER]),
  validate(addWishlistItemSchema, "body"),
  WishlistController.addProductToWishlist,
);

wishlistRouter.delete(
  "/wishlist/:productId",
  authenticate,
  requireRole([ROLES.USER]),
  validate(wishlistItemParamSchema, "params"),
  WishlistController.removeProductFromWishlist,
);

wishlistRouter.delete(
  "/wishlist",
  authenticate,
  requireRole([ROLES.USER]),
  WishlistController.clearWishlist,
);
