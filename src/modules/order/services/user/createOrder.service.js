import { AppError } from "#errors/AppError.js";
import { ORDER, ERROR_CODES } from "#constants/index.js";
import ProductModel from "#modules/product/product.model.js";
import CartModel from "#modules/cart/cart.model.js";
import OrderModel from "../../OrderModel/order.model.js";
import {
  validateCartItems,
  validateProductsStock,
} from "../../helpers/order.validators.js";
import {
  buildOrderSnapshot,
  buildProductQtyMapFromCart,
} from "../../helpers/order.builders.js";

/**
 * @param {string} userId
 * @param {string} email
 * @param {object} shippingAddress
 * @returns {Promise<{orderId: string, subTotal: number}>}
 */
export const createOrder = async (userId, email, shippingAddress) => {
  const cart = await CartModel.findOne({ userId });

  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is Empty", 400, ERROR_CODES.BAD_REQUEST_ERROR);
  }

  const cartItemsIds = cart.items.map((i) => i.productId);
  const targetProducts = await ProductModel.find({
    _id: { $in: cartItemsIds },
  });

  validateCartItems(targetProducts, cartItemsIds);

  const cartProductsQtysMap = buildProductQtyMapFromCart(cart);

  validateProductsStock(targetProducts, cartProductsQtysMap);

  const orderSnapshot = buildOrderSnapshot(targetProducts, cartProductsQtysMap);

  const totalAmount = orderSnapshot.reduce(
    (acc, cur) => acc + cur.lineTotal,
    0,
  );

  const orderStatusHistory = [
    { status: ORDER.ORDER_STATUS.CREATED, at: new Date(), by: userId },
  ];

  const order = await OrderModel.create({
    userId,
    email,
    orderSnapshot,
    subTotal: totalAmount,
    orderStatusHistory,
    shippingAddress,
  });

  await CartModel.updateOne(
    { userId },
    {
      items: [],
    },
  );

  return { orderId: order._id, subTotal: order.subTotal };
};
