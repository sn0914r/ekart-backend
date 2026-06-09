import { AppError } from "../../../../errors/AppError.js";
import OrderModel from "../../../../models/Order/Order.model.js";
import ProductModel from "../../../../models/Product.model.js";
import CartModel from "../../../../models/Cart.model.js";
import { ORDER_STATUS } from "../../../../constants/order.js";
import { ERROR_CODES } from "../../../../constants/errorCodes.js";
import {
  validateCartItems,
  validateProductsStock,
} from "../../order.validators.js";
import {
  buildOrderSnapshot,
  buildProductQtyMapFromCart,
} from "../../utils/build.utils.js";

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
    { status: ORDER_STATUS.CREATED, at: new Date(), by: userId },
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
