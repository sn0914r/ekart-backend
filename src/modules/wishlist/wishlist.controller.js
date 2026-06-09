import {
  addItemToWishlist,
  deleteItemInWishlist,
  deleteWishlist,
  getWishlist,
} from "./wishlist.services.js";

/**
 * @route GET /wishlist
 * @access Private
 */
export const getWishListController = async (req, res) => {
  const { userId } = req.user;

  const wishlist = await getWishlist(userId);

  return res.status(200).json({
    success: true,
    message: "Wishlist fetched successfully",
    data: wishlist,
  });
};

/**
 * @route POST /wishlist
 * @access Private
 */
export const addItemToWishListController = async (req, res) => {
  const { userId } = req.user;
  const { productId } = req.body;

  const wishlist = await addItemToWishlist(userId, productId);

  return res.status(200).json({
    success: true,
    message: "Product added to wishlist successfully",
    data: wishlist,
  });
};

/**
 * @route DELETE /wishlist/:productId
 * @access Private
 */
export const deleteItemInWishListController = async (req, res) => {
  const { userId } = req.user;
  const { productId } = req.params;

  const wishlist = await deleteItemInWishlist(userId, productId);

  return res.status(200).json({
    success: true,
    message: "Product deleted from wishlist successfully",
    data: wishlist,
  });
};

/**
 * @route DELETE /wishlist
 * @access Private
 */
export const deleteWishListController = async (req, res) => {
  const { userId } = req.user;

  await deleteWishlist(userId);

  return res.status(200).json({
    success: true,
    message: "Wishlist deleted successfully",
  });
};
