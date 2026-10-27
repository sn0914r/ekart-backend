import { CartRepository } from "./cart.repository.js";

export class CartService {
  /**
   * @param {Array} items
   * @returns {Array<object>}
   */
  static #formatCartItems(items = []) {
    return items
      .filter((item) => item.productId && typeof item.productId === "object")
      .map((item) => {
        const product = item.productId;

        return {
          productId: product._id,
          name: product.name,
          price: product.price,
          thumbnail: product.images?.[0] || null,
          stock: product.stock ?? 0,
          quantity: item.quantity,
          size: item.variant?.size || null,
          color: product.attributes?.color || null,
        };
      });
  }

  /**
   * @param {string} userId
   * @returns {Promise<{items: Array<object>}>}
   */
  static async getUserCart(userId) {
    const cart = await CartRepository.findCartWithProductDetails(userId);
    if (!cart?.items) return { items: [] };

    return { items: CartService.#formatCartItems(cart.items) };
  }

  /**
   * @param {string} userId
   * @param {string} productId
   * @param {object} [variant]
   * @returns {Promise<{items: Array<object>}>}
   */
  static async addProductToCart(userId, productId, variant = {}) {
    await CartRepository.addProduct(userId, productId, variant);
    return await CartService.getUserCart(userId);
  }

  /**
   * @param {string} userId
   * @param {string} productId
   * @returns {Promise<{items: Array<object>}>}
   */
  static async increaseProductQuantity(userId, productId) {
    await CartRepository.incrementProductQuantity(userId, productId);
    return await CartService.getUserCart(userId);
  }

  /**
   * @param {string} userId
   * @param {string} productId
   * @returns {Promise<{items: Array<object>}>}
   */
  static async decreaseProductQuantity(userId, productId) {
    await CartRepository.decrementProductQuantity(userId, productId);
    return await CartService.getUserCart(userId);
  }

  /**
   * @param {string} userId
   * @param {string} productId
   * @returns {Promise<{items: Array<object>}>}
   */
  static async removeProductFromCart(userId, productId) {
    await CartRepository.removeProduct(userId, productId);
    return await CartService.getUserCart(userId);
  }

  /**
   * @param {string} userId
   * @returns {Promise<{items: Array<object>}>}
   */
  static async clearUserCart(userId) {
    await CartRepository.clearCartByUserId(userId);
    return { items: [] };
  }
}
