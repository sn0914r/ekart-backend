const Service = require("./cart.service");

/**
 * @route GET /cart
 * @access Private
 */
const getCartController = async (req, res) => {
  const { userId } = req.user;

  const cart = await Service.getCart(userId);
  return res
    .status(200)
    .json({ success: true, cart, message: "Cart fetched successfully" });
};

/**
 * @route POST /cart/add
 * @access Private
 */
const addToCartController = async (req, res) => {
  const { userId } = req.user;
  const { productId, variant } = req.body;

  const cart = await Service.addToCart(productId, variant, userId);
  return res
    .status(200)
    .json({ success: true, cart, message: "Item added to cart" });
};

/**
 * @route PATCH /cart/increase
 * @access Private
 */
const incQuantityController = async (req, res) => {
  const { userId } = req.user;
  const { productId } = req.body;

  const cart = await Service.incQuantity(productId, userId);
  return res
    .status(200)
    .json({ success: true, cart, message: "Quantity increased successfully" });
};

/**
 * @route PATCH /cart/decrease
 * @access Private
 */
const decQuantityController = async (req, res) => {
  const { userId } = req.user;
  const { productId } = req.body;

  const cart = await Service.decQuantity(productId, userId);
  return res
    .status(200)
    .json({ success: true, cart, message: "Quantity decreased successfully" });
};

/**
 * @route DELETE /cart/remove
 * @access Private
 */
const removeFromCartController = async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;

  const cart = await Service.removeFromCart(id, userId);
  return res
    .status(200)
    .json({ success: true, cart, message: "Item removed successfully" });
};

/**
 * @route DELETE /cart/clear
 * @access Private
 */
const clearCartController = async (req, res) => {
  const { userId } = req.user;

  const cart = await Service.clearCart(userId);
  return res
    .status(200)
    .json({ success: true, cart, message: "Cart cleared successfully" });
};

module.exports = {
  getCartController,
  addToCartController,
  incQuantityController,
  decQuantityController,
  removeFromCartController,
  clearCartController,
};
