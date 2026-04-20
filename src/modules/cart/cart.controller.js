const { getCart, updateCart } = require("./cart.service");

/**
 * @route GET /cart
 * @access Private
 */
const getCartController = async (req, res) => {
  const { uid } = req.user;
  const cart = await getCart(uid);

  res.status(200).json({
    success: true,
    message: "Cart fetched successfully",
    data: cart,
  });
};

/**
 * @route PUT /cart
 * @access Private
 */
const updateCartController = async (req, res) => {
  const { uid } = req.user;
  const { items } = req.body;

  const cart = await updateCart({ uid, items });
  res.status(200).json({
    success: true,
    message: "Cart updated successfully",
    data: cart,
  });
};

module.exports = { getCartController, updateCartController };
