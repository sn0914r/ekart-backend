import { WishlistService } from "./wishlist.service.js";

export class WishlistController {
  /**
   * @route GET /wishlist
   * @access Private
   */
  static async getWishlist(req, res) {
    const { userId } = req.user;

    const wishlist = await WishlistService.getUserWishlist(userId);

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: wishlist,
    });
  }

  /**
   * @route POST /wishlist
   * @access Private
   */
  static async addProductToWishlist(req, res) {
    const { userId } = req.user;
    const { productId } = req.body;

    const result = await WishlistService.addProductToWishlist(
      userId,
      productId,
    );

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist successfully",
      data: result,
    });
  }

  /**
   * @route DELETE /wishlist/:productId
   * @access Private
   */
  static async removeProductFromWishlist(req, res) {
    const { userId } = req.user;
    const { productId } = req.params;

    await WishlistService.removeProductFromWishlist(userId, productId);

    return res.status(200).json({
      success: true,
      message: "Product deleted from wishlist successfully",
    });
  }

  /**
   * @route DELETE /wishlist
   * @access Private
   */
  static async clearWishlist(req, res) {
    const { userId } = req.user;

    await WishlistService.clearUserWishlist(userId);

    return res.status(200).json({
      success: true,
      message: "Wishlist deleted successfully",
    });
  }
}
