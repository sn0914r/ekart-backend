import { CartService } from "./cart.service.js";

export class CartController {
  /**
   * @route GET /cart
   * @access Private
   */
  static async getCart(req, res) {
    const { userId } = req.user;

    const cart = await CartService.getUserCart(userId);

    return res.status(200).json({
      success: true,
      data: cart,
      message: "Cart fetched successfully",
    });
  }

  /**
   * @route POST /cart/add
   * @access Private
   */
  static async addProductToCart(req, res) {
    const { userId } = req.user;
    const { productId, variant } = req.body;

    const cart = await CartService.addProductToCart(userId, productId, variant);

    return res.status(200).json({
      success: true,
      data: cart,
      message: "Item added to cart",
    });
  }

  /**
   * @route PATCH /cart/increase
   * @access Private
   */
  static async increaseProductQuantity(req, res) {
    const { userId } = req.user;
    const { productId } = req.body;

    const cart = await CartService.increaseProductQuantity(userId, productId);

    return res.status(200).json({
      success: true,
      data: cart,
      message: "Quantity increased successfully",
    });
  }

  /**
   * @route PATCH /cart/decrease
   * @access Private
   */
  static async decreaseProductQuantity(req, res) {
    const { userId } = req.user;
    const { productId } = req.body;

    const cart = await CartService.decreaseProductQuantity(userId, productId);

    return res.status(200).json({
      success: true,
      data: cart,
      message: "Quantity decreased successfully",
    });
  }

  /**
   * @route DELETE /cart/remove/:id
   * @access Private
   */
  static async removeProductFromCart(req, res) {
    const { userId } = req.user;
    const { id: productId } = req.params;

    const cart = await CartService.removeProductFromCart(userId, productId);

    return res.status(200).json({
      success: true,
      data: cart,
      message: "Item removed successfully",
    });
  }

  /**
   * @route DELETE /cart/clear
   * @access Private
   */
  static async clearCart(req, res) {
    const { userId } = req.user;

    const cart = await CartService.clearUserCart(userId);

    return res.status(200).json({
      success: true,
      data: cart,
      message: "Cart cleared successfully",
    });
  }
}
