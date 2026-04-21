const AppError = require("../../errors/AppError");
const OrderModel = require("../../models/Order/Order.model");
const ProductModel = require("../../models/Product.model");
const UserModel = require("../../models/User.model");
const CartModel = require("../../models/Cart.model");
const { ORDER_STATUS, SHIPPING_STATUS } = require("../../constants/order");
const { ROLES } = require("../../constants/roles");
const { ERROR_CODES } = require("../../constants/errorCodes");
const {
  validateOrderStatusTransition,
} = require("./validators/order.validator");
const {
  validateShippingStatusTransition,
} = require("./validators/shipping.validator");
const {
  validateCart,
  validateProductsExists,
  validateStock,
} = require("./validators/order.validator");
const {
  buildProductQtyMap,
  calculateSubtotal,
} = require("./helpers/order.helpers");
const { logger } = require("../../utils/logger");

/**
 * Creates an order
 *
 * @param {string} userId - user id
 * @param {string} email - user email
 * @param {object} shippingAddress - shipping address
 * @returns {object} created order
 */
const createOrder = async ({ userId, email, shippingAddress }) => {
  logger.info("Creating Order");
  logger.info("userId: " + userId);

  const cart = await CartModel.findOne({ uid: userId });
  logger.info("cart: " + JSON.stringify(cart));
  validateCart(cart);

  const productIds = cart.items.map((i) => i.productId);
  const targetProducts = await ProductModel.find({ _id: { $in: productIds } });
  validateProductsExists(targetProducts, productIds);

  const productQtyMap = buildProductQtyMap(cart);
  validateStock(targetProducts, productQtyMap);

  const orderSnapshot = targetProducts.map((product) => {
    const qty = productQtyMap.get(product._id.toString());

    return {
      productId: product._id,
      quantity: qty,
      name: product.name,
      unitPrice: product.price,
      imageUrl: product.imageUrl,
      lineTotal: product.price * qty,
    };
  });

  logger.info("Order snapshot: " + orderSnapshot);

  const subTotal = calculateSubtotal(orderSnapshot);

  const orderStatusHistory = [
    { status: ORDER_STATUS.CREATED, at: new Date(), by: userId },
  ];

  const shippingStatusHistory = [
    { status: SHIPPING_STATUS.PENDING, at: new Date(), by: userId },
  ];

  const order = await OrderModel.create({
    userId,
    email,
    orderSnapshot,
    subTotal,
    orderStatusHistory,
    shippingStatusHistory,
    shippingAddress,
  });

  await CartModel.deleteOne({ uid: userId });

  logger.info("Order created successfully");
  return { orderId: order._id, subTotal: order.subTotal };
};

/**
 * Gets the User's Order
 *
 * @param {string} uid - user id
 * @returns {object[]} Array of orders
 */
const getOrders = async ({ uid }) => {
  const orders = await OrderModel.find(
    { userId: uid },
    {
      orderSnapshot: 1,
      shippingAddress: 1,
      orderStatus: 1,
      paymentStatus: 1,
      shippingStatus: 1,
      subTotal: 1,
      createdAt: 1,
    },
  );
  return orders;
};

/**
 * Updates the User's Order Status
 *
 * @param {string} id - order id
 * @param {string} uid - user id
 * @param {string} orderStatus - order status
 * @param {object} shippingAddress - shipping address
 * @returns {object} updated order
 */
const updateOrder = async ({ id, uid, orderStatus, shippingAddress }) => {
  const order = await OrderModel.findById(id);

  if (!order)
    throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);

  if (orderStatus) {
    validateOrderStatusTransition(order.orderStatus, orderStatus);
    order.orderStatus = orderStatus;
    order.orderStatusHistory.push({
      status: orderStatus,
      at: new Date(),
      by: uid,
    });
  }
  if (shippingAddress) {
    order.shippingAddress = shippingAddress;
  }

  await order.save();
  return order;
};

// ======================================== ADMIN ========================================

/**
 * Gets all the orders for admin
 *
 * @param {string} uid - user id
 * @returns {object[]} Array of orders
 */
const getOrdersForAdmin = async () => {
  return await OrderModel.find(
    {},
    {
      email: 1,
      subTotal: 1,
      paymentStatus: 1,
      shippingStatus: 1,
      orderStatus: 1,
      createdAt: 1,
    },
  ).sort({ createdAt: -1 });
};

/**
 * Gets the Single Order for admin
 *
 * @param {string} id - order id
 * @returns {object} order
 */
const getOrderForAdmin = async (id) => {
  const order = await OrderModel.findOne({ _id: id });
  if (!order)
    throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);

  return order;
};

/**
 * Updates the Shipping Status of the Order
 *
 * @param {string} id - order id
 * @param {string} uid - user id
 * @param {string} shippingStatus - shipping status
 * @returns {object} updated order
 */

const updateOrderByAdmin = async ({ id, uid, shippingStatus }) => {
  const order = await OrderModel.findById(id);

  if (!order)
    throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);

  validateShippingStatusTransition(order.shippingStatus, shippingStatus);
  order.shippingStatus = shippingStatus;
  order.shippingStatusHistory.push({
    status: shippingStatus,
    at: new Date(),
    by: uid,
  });

  await order.save();
  logger.info("Shipping status updated successfully");
  logger.info("New Shipping status: " + shippingStatus);
  return { shippingStatus: order.shippingStatus };
};

module.exports = {
  createOrder,
  updateOrder,
  getOrders,

  getOrdersForAdmin,
  getOrderForAdmin,
  updateOrderByAdmin,
};
