const CartService = require("./cart.service");

const getCartController = async (req, res) => {
  const { uid } = req.user;

  const cart = await CartService.getCart({ uid });

  res.status(200).json({
    success: true,
    message: "Cart fetched successfully",
    data: cart,
  });
};

const updateCartController = async (req, res) => {
  const { uid } = req.user;
  const { items } = req.body;

  const cart = await CartService.updateCart({ uid, items });

  res.status(200).json({
    success: true,
    message: "Cart updated successfully",
    data: cart,
  });
};

module.exports = { getCartController, updateCartController };
