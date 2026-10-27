import WishlistModel from "#db/models/wishlist.model.js";

export class WishlistRepository {
  /**
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  static async findWishlistByUserId(userId) {
    return await WishlistModel.findOne({ userId }).lean();
  }

  /**
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  static async findWishlistWithProductDetails(userId) {
    return await WishlistModel.findOne({ userId })
      .populate("items.productId", "name price images attributes")
      .lean();
  }

  /**
   * @param {string} userId
   * @param {string} productId
   * @returns {Promise<boolean>}
   */
  static async isProductInWishlist(userId, productId) {
    const exists = await WishlistModel.exists({
      userId,
      "items.productId": productId,
    });
    return Boolean(exists);
  }

  /**
   * @param {string} userId
   * @param {string} productId
   * @returns {Promise<object>}
   */
  static async addProduct(userId, productId) {
    return await WishlistModel.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: { userId },
        $push: { items: { productId, addedAt: new Date() } },
      },
      { upsert: true, returnDocument: "after" },
    ).lean();
  }

  /**
   * @param {string} userId
   * @param {string} productId
   * @returns {Promise<object|null>}
   */
  static async removeProduct(userId, productId) {
    return await WishlistModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { returnDocument: "after" },
    ).lean();
  }

  /**
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  static async clearWishlistByUserId(userId) {
    const result = await WishlistModel.deleteOne({ userId });
    return result.deletedCount > 0;
  }
}
