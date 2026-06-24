import WishlistModel from "./wishlist.model.js";
import { AppError } from "../../errors/AppError.js";
import { ERROR_CODES } from "../../constants/errorCodes.js";
import { formattedWishlistItems } from "./utils/formatWishlist.js";

/**
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export const getWishlist = async (userId) => {
  const wishlist = await WishlistModel.findOne({ userId }).populate(
    "items.productId",
    "name price images attributes",
  );
  if (!wishlist) return [];

  const formattedWishlist = formattedWishlistItems(wishlist.items);
  return formattedWishlist;
};

/**
 * @param {string} userId
 * @param {string} productId
 * @returns {Promise<{productId: string}>}
 */
export const addItemToWishlist = async (userId, productId) => {
  const wishlist = await WishlistModel.findOne({ userId });
  if (!wishlist) {
    const newWishlist = new WishlistModel({
      userId,
      items: [{ productId, addedAt: new Date() }],
    });
    await newWishlist.save();
    return newWishlist.items[0];
  }

  const isExists = wishlist.items.some(
    (item) => item.productId.toString() === productId,
  );
  if (isExists) {
    throw new AppError(
      "Product already exists in the wishlist",
      409,
      ERROR_CODES.CONFLICT_ERROR,
    );
  }

  wishlist.items.push({ productId, addedAt: new Date() });
  await wishlist.save();
  return { productId };
};

/**
 * @param {string} userId
 * @param {string} productId
 */
export const deleteItemInWishlist = async (userId, productId) => {
  const wishlist = await WishlistModel.findOne({ userId });
  if (!wishlist) {
    throw new AppError("Wishlist not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }
  const isExists = wishlist.items.some(
    (item) => item.productId.toString() === productId,
  );
  if (!isExists) {
    throw new AppError(
      "Product not found in wishlist",
      404,
      ERROR_CODES.NOT_FOUND_ERROR,
    );
  }
  wishlist.items = wishlist.items.filter(
    (item) => item.productId.toString() !== productId,
  );
  await wishlist.save();
  return;
};

/**
 * @param {string} userId
 */
export const deleteWishlist = async (userId) => {
  const wishlist = await WishlistModel.findOne({ userId });
  if (!wishlist) {
    throw new AppError("Wishlist not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }
  await wishlist.deleteOne();
  return;
};
