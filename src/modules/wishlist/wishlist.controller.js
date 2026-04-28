const Service = require("./wishlist.services");

/**
 * @route GET /wishlist
 * @access Private
 * @desc Gets the wishlist
 */
const getWishListController = async (req, res) => {
  const { userId } = req.user;
  const wishlist = await Service.getWishlist(userId);

  return res.status(200).json({
    success: true,
    message: "Wishlist fetched successfully",
    data: wishlist,
  });
};

/**
 * @route POST /wishlist
 * @access Private
 * @desc Adds a product to the wishlist
 */
const addItemToWishListController = async (req, res) => {
  const { userId } = req.user;
  const { productId } = req.body;

  const wishlist = await Service.addItemToWishlist(userId, productId);

  return res.status(200).json({
    success: true,
    message: "Product added to wishlist successfully",
    data: wishlist,
  });
};

/**
 * @route DELETE /wishlist/:productId
 * @access Private
 * @desc Deletes a product from the wishlist
 */
const deleteItemInWishListController = async (req, res) => {
  const { userId } = req.user;
  const { productId } = req.params;

  const wishlist = await Service.deleteItemInWishlist(userId, productId);

  return res.status(200).json({
    success: true,
    message: "Product deleted from wishlist successfully",
    data: wishlist,
  });
};

/**
 * @route DELETE /wishlist
 * @access Private
 * @desc Deletes the wishlist
 */
const deleteWishListController = async (req, res) => {
  const { userId } = req.user;

  await Service.deleteWishlist(userId);

  return res.status(200).json({
    success: true,
    message: "Wishlist deleted successfully",
  });
};

module.exports = {
  getWishListController,
  addItemToWishListController,
  deleteItemInWishListController,
  deleteWishListController,
};
