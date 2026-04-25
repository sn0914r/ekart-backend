const CartModel = require("../../models/Cart.model");
const { logger } = require("../../utils/logger");
const { formatCartList } = require("./cart.helpers");

/**
 * Gets the Whole Cart Array
 *
 * @param {string} userId
 * @returns {object} cart
 */
const getCart = async (userId) => {
  const cart = await CartModel.findOne({ userId }, { items: 1 }).populate(
    "items.productId",
    "name images price stock",
  );

  if (!cart) return { items: [] };

  const formattedItems = formatCartList(cart.items);
  return { items: formattedItems };
};

/**
 * Add new Item to the cart
 *
 * @param {string} productId
 * @param {object} variant - {size, color}
 * @param {string} userId
 * @returns {object} cart
 */
const addToCart = async (productId, variant, userId) => {
  logger.info("======== addToCart =========");
  logger.info("productId: " + JSON.stringify(productId));
  logger.info("variant: " + JSON.stringify(variant));
  logger.info("userId: " + JSON.stringify(userId));

  let cart = await CartModel.findOne({ userId });
  logger.info("cart from addToCart: " + JSON.stringify(cart));
  if (!cart) {
    cart = await CartModel.create({ userId, items: [] });
  }

  const item = cart.items.find(
    (item) => item.productId.toString() === productId,
  );

  if (item) {
    item.quantity += 1;
  } else {
    logger.info("======== pushing new item to cart ===========");
    logger.info("productId: " + JSON.stringify(productId));
    logger.info("variant: " + JSON.stringify(variant));
    cart.items.push({ productId, variant });
  }

  await cart.save();

  const updatedCart = await CartModel.findOne(
    { userId },
    { items: 1 },
  ).populate("items.productId", "name images price stock");

  const formattedItems = formatCartList(updatedCart.items);
  return { items: formattedItems };
};

/**
 * Increase product quantity
 *
 * @param {string} productId
 * @param {string} userId
 * @returns {object} cart
 */
const incQuantity = async (productId, userId) => {
  logger.info("======== incQuantity START ========");
  const cart = await CartModel.findOne({ userId });
  logger.info("cart from incQuantity: ");
  logger.info(cart);

  const item = cart.items.find((item) => item.productId.toString() === productId);
  
  if (item) item.quantity += 1;
  
  await cart.save();
  
  const updatedCart = await CartModel.findOne(
    { userId },
    { items: 1 },
  ).populate("items.productId", "name images price stock");
  
  logger.info("updatedCart from incQuantity: ");
  logger.info(updatedCart);
  
  const formattedItems = formatCartList(updatedCart.items);
  logger.info("======== incQuantity END ==========");
  return { items: formattedItems };
};

/**
 * Decrease product quantity
 *
 * @param {string} productId
 * @param {string} userId
 * @returns {object} cart
 */
const decQuantity = async (productId, userId) => {
  const cart = await CartModel.findOne({ userId });
  const item = cart.items.find(
    (item) => item.productId.toString() === productId,
  );
  if (item) {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    }
  }
  await cart.save();
  const updatedCart = await CartModel.findOne(
    { userId },
    { items: 1 },
  ).populate("items.productId", "name images price stock");

  const formattedItems = formatCartList(updatedCart.items);
  return { items: formattedItems };
};

/**
 * Remove a product
 *
 * @param {string} productId
 * @param {string} userId
 * @returns {object} cart
 */
const removeFromCart = async (productId, userId) => {
  logger.info("======== removeFromCart START ========")
  logger.info("productId: " + JSON.stringify(productId));
  logger.info("userId: " + JSON.stringify(userId));

  const cart = await CartModel.findOne({ userId });
  logger.info("CART")
  logger.info(cart)
  cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
  logger.info("CART AFTER REMOVAL")
  logger.info(cart)
  await cart.save();
  
  const updatedCart = await CartModel.findOne(
    { userId },
    { items: 1 },
  ).populate("items.productId", "name images price stock");

  const formattedItems = formatCartList(updatedCart.items);
  return { items: formattedItems };
};

/**
 * Clear cart
 *
 * @param {string} userId
 * @returns {object} cart
 */
const clearCart = async (userId) => {
  const cart = await CartModel.findOne({ userId });
  cart.items = [];
  await cart.save();
  return { items: [] };
};

module.exports = {
  getCart,
  addToCart,
  decQuantity,
  incQuantity,
  removeFromCart,
  clearCart,
};
