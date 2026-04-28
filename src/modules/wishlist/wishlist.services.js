const WishlistModel = require("../../models/WishList");
const AppError = require("../../errors/AppError");
const { ERROR_CODES } = require("../../constants/errorCodes");
const { formattedWishlistItems } = require("./helpers/formatWishlist");
const { logger } = require("../../utils/logger");

/**
 * @param {string} userId
 * @returns {object[]} wishlist
 */
const getWishlist = async (userId) => {
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
 * @return {object[]} wishlist
 */
const addItemToWishlist = async (userId, productId) => {
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
      400,
      ERROR_CODES.BAD_REQUEST_ERROR,
    );
  }

  wishlist.items.push({ productId, addedAt: new Date() });
  await wishlist.save();
  return { productId };
};

/**
 * @param {string} userId
 * @param {string} productId
 * @return {object} wishlist
 */
const deleteItemInWishlist = async (userId, productId) => {
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
  return ;
};

/**
 * @param {string} userId
 */
const deleteWishlist = async (userId) => {
  const wishlist = await WishlistModel.findOne({ userId });
  if (!wishlist) {
    throw new AppError("Wishlist not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }
  await wishlist.deleteOne();
  return;
};

module.exports = {
  getWishlist,
  addItemToWishlist,
  deleteItemInWishlist,
  deleteWishlist,
};
