import CartModel from "#db/models/cart.model.js";

export class CartRepository {
  /**
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  static async findCartByUserId(userId) {
    return await CartModel.findOne({ userId }).lean();
  }

  /**
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  static async findCartWithProductDetails(userId) {
    return await CartModel.findOne({ userId }, { items: 1 })
      .populate("items.productId", "name images price stock attributes")
      .lean();
  }

  /**
   * @param {string} userId
   * @param {string} productId
   * @returns {Promise<object|null>}
   */
  static async findCartItem(userId, productId) {
    const cart = await CartModel.findOne(
      { userId, "items.productId": productId },
      { "items.$": 1 },
    ).lean();

    return cart?.items?.[0] || null;
  }

  /**
   * @param {string} userId
   * @param {string} productId
   * @param {object} [variant]
   * @returns {Promise<object>}
   */
  static async addProduct(userId, productId, variant = {}) {
    const existingItem = await CartRepository.findCartItem(userId, productId);

    if (existingItem) {
      return await CartModel.findOneAndUpdate(
        { userId, "items.productId": productId },
        { $inc: { "items.$.quantity": 1 } },
        { returnDocument: "after" },
      ).lean();
    }

    return await CartModel.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: { userId },
        $push: { items: { productId, variant, quantity: 1 } },
      },
      { upsert: true, returnDocument: "after" },
    ).lean();
  }

  /**
   * @param {string} userId
   * @param {string} productId
   * @returns {Promise<object|null>}
   */
  static async incrementProductQuantity(userId, productId) {
    return await CartModel.findOneAndUpdate(
      { userId, "items.productId": productId },
      { $inc: { "items.$.quantity": 1 } },
      { returnDocument: "after" },
    ).lean();
  }

  /**
   * @param {string} userId
   * @param {string} productId
   * @returns {Promise<object|null>}
   */
  static async decrementProductQuantity(userId, productId) {
    const cart = await CartModel.findOneAndUpdate(
      { userId, "items.productId": productId },
      { $inc: { "items.$.quantity": -1 } },
      { returnDocument: "after" },
    ).lean();

    // If quantity dropped to 0 or below, remove item from cart
    const updatedItem = cart?.items?.find(
      (item) => item.productId.toString() === productId.toString(),
    );

    if (updatedItem && updatedItem.quantity <= 0) {
      return await CartRepository.removeProduct(userId, productId);
    }

    return cart;
  }

  /**
   * @param {string} userId
   * @param {string} productId
   * @returns {Promise<object|null>}
   */
  static async removeProduct(userId, productId) {
    return await CartModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { returnDocument: "after" },
    ).lean();
  }

  /**
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  static async clearCartByUserId(userId) {
    return await CartModel.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { returnDocument: "after" },
    ).lean();
  }
}
