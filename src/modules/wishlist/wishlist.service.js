import { AppError } from "#errors/AppError.js";
import { ERROR_CODES } from "#constants/index.js";
import { WishlistRepository } from "./wishlist.repository.js";

export class WishlistService {
  /**
   * @param {Array} items
   * @returns {Array<object>}
   */
  static #formatWishlistItems(items = []) {
    return items
      .filter((item) => item.productId && typeof item.productId === "object")
      .map((item) => {
        const product = item.productId;

        return {
          productId: product._id,
          name: product.name,
          price: product.price,
          thumbnail: product.images?.[0] || null,
        };
      });
  }

  /**
   * @param {string} userId
   * @returns {Promise<Array<object>>}
   */
  static async getUserWishlist(userId) {
    const wishlist =
      await WishlistRepository.findWishlistWithProductDetails(userId);
    if (!wishlist?.items) return [];

    return WishlistService.#formatWishlistItems(wishlist.items);
  }

  /**
   * @param {string} userId
   * @param {string} productId
   * @returns {Promise<{productId: string}>}
   */
  static async addProductToWishlist(userId, productId) {
    const isExists = await WishlistRepository.isProductInWishlist(
      userId,
      productId,
    );
    if (isExists) {
      throw new AppError(
        "Product already exists in the wishlist",
        409,
        ERROR_CODES.CONFLICT_ERROR,
      );
    }

    await WishlistRepository.addProduct(userId, productId);
    return { productId };
  }

  /**
   * @param {string} userId
   * @param {string} productId
   * @returns {Promise<void>}
   */
  static async removeProductFromWishlist(userId, productId) {
    const isExists = await WishlistRepository.isProductInWishlist(
      userId,
      productId,
    );
    if (!isExists) {
      throw new AppError(
        "Product not found in wishlist",
        404,
        ERROR_CODES.NOT_FOUND_ERROR,
      );
    }

    await WishlistRepository.removeProduct(userId, productId);
  }

  /**
   * @param {string} userId
   * @returns {Promise<void>}
   */
  static async clearUserWishlist(userId) {
    const wishlist = await WishlistRepository.findWishlistByUserId(userId);
    if (!wishlist) {
      throw new AppError(
        "Wishlist not found",
        404,
        ERROR_CODES.NOT_FOUND_ERROR,
      );
    }

    await WishlistRepository.clearWishlistByUserId(userId);
  }
}
