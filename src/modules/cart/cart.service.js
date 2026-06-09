import CartModel from "../../models/Cart.model.js";
import { formatCartList } from "./cart.utils.js";

/**
 * @typedef {Object} CartItem
 * @property {string} productId
 * @property {string} name
 * @property {number} price
 * @property {string} thumbnail
 * @property {number} stock
 * @property {number} quantity
 * @property {string} size
 * @property {string} color
 */

/**
 * @param {string} userId
 * @returns {Promise<{items: CartItem[]}>}
 */
export const getCart = async (userId) => {
  const cart = await CartModel.findOne({ userId }, { items: 1 }).populate(
    "items.productId",
    "name images price stock attributes",
  );

  if (!cart) return { items: [] };

  const formattedItems = formatCartList(cart.items);
  return { items: formattedItems };
};

/**
 * @param {string} productId
 * @param {{size: number | string, color: string}} variant
 * @param {string} userId
 * @returns {Promise<{items: CartItem[]}>}
 */
export const addToCart = async (productId, variant, userId) => {
  let cart = await CartModel.findOne({ userId });
  if (!cart) {
    cart = await CartModel.create({ userId, items: [] });
  }

  const item = cart.items.find(
    (item) => item.productId.toString() === productId,
  );

  if (item) {
    item.quantity += 1;
  } else {
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
 * @param {string} productId
 * @param {string} userId
 * @returns {Promise<{items: CartItem[]}>}
 */
export const incQuantity = async (productId, userId) => {
  const cart = await CartModel.findOne({ userId });

  const item = cart.items.find(
    (item) => item.productId.toString() === productId,
  );

  if (item) item.quantity += 1;

  await cart.save();

  const updatedCart = await CartModel.findOne(
    { userId },
    { items: 1 },
  ).populate("items.productId", "name images price stock");

  const formattedItems = formatCartList(updatedCart.items);
  return { items: formattedItems };
};

/**
 * @param {string} productId
 * @param {string} userId
 * @returns {Promise<{items: CartItem[]}>}
 */
export const decQuantity = async (productId, userId) => {
  const cart = await CartModel.findOne({ userId });
  const item = cart.items.find(
    (item) => item.productId.toString() === productId,
  );
  if (item) {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId,
      );
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
 * @param {string} productId
 * @param {string} userId
 * @returns {Promise<{items: CartItem[]}>}
 */
export const removeFromCart = async (productId, userId) => {
  const cart = await CartModel.findOne({ userId });
  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId,
  );
  await cart.save();

  const updatedCart = await CartModel.findOne(
    { userId },
    { items: 1 },
  ).populate("items.productId", "name images price stock");

  const formattedItems = formatCartList(updatedCart.items);
  return { items: formattedItems };
};

/**
 * @param {string} userId
 * @returns {Promise<{items: []}>}
 */
export const clearCart = async (userId) => {
  const cart = await CartModel.findOne({ userId });
  cart.items = [];
  await cart.save();
  return { items: [] };
};
