import { Router } from "express";
import { ROLES } from "../../constants/roles.js";
import { authenticate, requireRole } from "../../middlewares/auth.middleware.js";
import {
  addItemToWishListController,
  deleteItemInWishListController,
  deleteWishListController,
  getWishListController,
} from "./wishlist.controller.js";

export const wishlistRouter = Router();

wishlistRouter.get(
  "/wishlist",
  authenticate,
  requireRole([ROLES.USER]),
  getWishListController,
);

wishlistRouter.post(
  "/wishlist",
  authenticate,
  requireRole([ROLES.USER]),
  addItemToWishListController,
);

wishlistRouter.delete(
  "/wishlist/:productId",
  authenticate,
  requireRole([ROLES.USER]),
  deleteItemInWishListController,
);

wishlistRouter.delete(
  "/wishlist",
  authenticate,
  requireRole([ROLES.USER]),
  deleteWishListController,
);
