import {
  getCart,
  addToCart,
  incQuantity,
  decQuantity,
  removeFromCart,
  clearCart,
} from "./cart.service.js";

/**
 * @route GET /cart
 * @access Private
 */
export const getCartController = async (req, res) => {
  const { userId } = req.user;

  const cart = await getCart(userId);
  return res
    .status(200)
    .json({ success: true, data: cart, message: "Cart fetched successfully" });
};

/**
 * @route POST /cart/add
 * @access Private
 */
export const addToCartController = async (req, res) => {
  const { userId } = req.user;
  const { productId, variant } = req.body;

  const cart = await addToCart(productId, variant, userId);
  return res
    .status(200)
    .json({ success: true, data: cart, message: "Item added to cart" });
};

/**
 * @route PATCH /cart/increase
 * @access Private
 */
export const incQuantityController = async (req, res) => {
  const { userId } = req.user;
  const { productId } = req.body;

  const cart = await incQuantity(productId, userId);
  return res
    .status(200)
    .json({ success: true, data: cart, message: "Quantity increased successfully" });
};

/**
 * @route PATCH /cart/decrease
 * @access Private
 */
export const decQuantityController = async (req, res) => {
  const { userId } = req.user;
  const { productId } = req.body;

  const cart = await decQuantity(productId, userId);
  return res
    .status(200)
    .json({ success: true, data: cart, message: "Quantity decreased successfully" });
};

/**
 * @route DELETE /cart/remove
 * @access Private
 */
export const removeFromCartController = async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;

  const cart = await removeFromCart(id, userId);
  return res
    .status(200)
    .json({ success: true, data: cart, message: "Item removed successfully" });
};

/**
 * @route DELETE /cart/clear
 * @access Private
 */
export const clearCartController = async (req, res) => {
  const { userId } = req.user;

  const cart = await clearCart(userId);
  return res
    .status(200)
    .json({ success: true, data: cart, message: "Cart cleared successfully" });
};
