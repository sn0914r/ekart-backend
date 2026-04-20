const CartModel = require("../../models/Cart.model");

/**
 * Gets the Whole Cart Array
 *
 * @param {string} uid - user id
 * @returns {object} cart
 */
const getCart = async (uid) => {
  const cart = await CartModel.findOne({ uid });
  return cart;
};

/**
 * Updates the Cart
 *
 * @param {string} uid - user id
 * @param {Array} items - array of items
 * @returns {object} updated cart
 */
const updateCart = async ({ uid, items }) => {
  const cart = await CartModel.findOneAndUpdate(
    { uid },
    { items },
    { upsert: true, new: true },
  );

  return cart;
};
module.exports = {
  updateCart,
  getCart,
};
