const AppError = require("../../../errors/AppError");
const OrderModel = require("../../../models/Order/Order.model");
const ProductModel = require("../../../models/Product.model");
const UserModel = require("../../../models/User.model");
const CartModel = require("../../../models/Cart.model");
const { ORDER_STATUS, SHIPPING_STATUS } = require("../../../constants/order");
const { ROLES } = require("../../../constants/roles");
const { ERROR_CODES } = require("../../../constants/errorCodes");
const {
  validateOrderStatusTransition,
} = require("../validators/order.validator");
const {
  validateShippingStatusTransition,
} = require("../validators/shipping.validator");
const {
  validateCart,
  validateProductsExists,
  validateStock,
} = require("../validators/order.validator");
const {
  buildProductQtyMap,
  calculateSubtotal,
} = require("../order.utils");
const {
  cancelOrderWithStockReversal,
} = require("./cancelOrder");
const { logger } = require("../../../utils/logger");

/**
 * Creates an order
 *
 * @param {string} userId - user id
 * @param {string} email - user email
 * @param {object} shippingAddress - shipping address
 * @returns {object} created order
 */
const createOrder = async (userId, email, shippingAddress) => {
  logger.info("[User Id]: " + userId);
  logger.info("[Shipping Address]: " + shippingAddress);

  const cart = await CartModel.findOne({ userId });
  logger.info("[CART] " + cart);
  validateCart(cart);

  const productIds = cart.items.map((i) => i.productId);
  const targetProducts = await ProductModel.find({ _id: { $in: productIds } });
  logger.info("[TARGET PRODUCTS LIST] " + targetProducts);
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
      imageUrl: product.images[0],
      lineTotal: product.price * qty,
    };
  });

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

  await CartModel.updateOne(
    { userId },
    {
      items: [],
    },
  );

  return { orderId: order._id, subTotal: order.subTotal };
};

/**
 * Gets all the User's Orders
 *
 * @param {string} userId - user id
 * @returns {object[]} Array of orders
 */
const getOrders = async (userId) => {
  const orders = await OrderModel.find(
    { userId },
    {
      orderSnapshot: 1,
      shippingAddress: 1,
      orderStatus: 1,
      paymentStatus: 1,
      shippingStatus: 1,
      subTotal: 1,
      createdAt: 1,
    },
  ).sort({ createdAt: -1 });
  return orders;
};

/**
 * Get a specific order of a User
 *
 * @param {string} userId
 * @param {string} orderId
 * @returns {object} order details
 */
const getOrder = async (userId, orderId) => {
  const order = await OrderModel.findById(orderId, {
    userId: 1,
    email: 1,
    orderSnapshot: 1,
    subTotal: 1,
    orderStatus: 1,
    paymentStatus: 1,
    shippingStatus: 1,
    orderStatusHistory: 1,
    shippingStatusHistory: 1,
    shippingAddress: 1,
    createdAt: 1,
    "paymentDetails.razorpayPaymentId": 1,
  });

  if (!order)
    throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);

  if (order.userId !== userId)
    throw new AppError(
      "You are not authorized to access this order",
      403,
      ERROR_CODES.UNAUTHORIZED_ERROR,
    );

  return order;
};

/**
 * Updates the User's Order Status
 *
 * @param {string} orderId
 * @param {string} userId
 * @param {object} updates - { orderStatus, shippingAddress }
 * @returns {object} updated order
 */
const updateOrder = async (orderId, userId, updates) => {
  const order = await OrderModel.findById(orderId);

  if (!order)
    throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);

  if (updates.orderStatus) {
    if (
      order.orderStatus === ORDER_STATUS.CREATED ||
      (order.orderStatus === ORDER_STATUS.CONFIRMED &&
        order.shippingStatus === SHIPPING_STATUS.PENDING)
    ) {
      await cancelOrderWithStockReversal(orderId, userId);
    } else {
      throw new AppError(
        "Invalid order status transition",
        400,
        ERROR_CODES.BAD_REQUEST_ERROR,
      );
    }
  }
  if (updates.shippingAddress) {
    order.shippingAddress = updates.shippingAddress;
  }

  await order.save();
  return order;
};

// ======================================== ADMIN ========================================

/**
 * Gets all the orders for admin
 *
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
 * @param {string} orderId
 * @returns {object} order
 */
const getOrderForAdmin = async (orderId) => {
  const order = await OrderModel.findById(orderId);
  if (!order)
    throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);

  return order;
};

/**
 * Updates the Shipping Status of the Order
 *
 * @param {string} orderId
 * @param {string} userId
 * @param {string} shippingStatus
 * @returns {object} updated order
 */

const updateOrderByAdmin = async (orderId, userId, shippingStatus) => {
  const order = await OrderModel.findById(orderId);

  if (!order)
    throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);

  validateShippingStatusTransition(order.shippingStatus, shippingStatus);
  order.shippingStatus = shippingStatus;
  order.shippingStatusHistory.push({
    status: shippingStatus,
    at: new Date(),
    by: userId,
  });

  await order.save();

  return { shippingStatus: order.shippingStatus };
};

module.exports = {
  createOrder,
  updateOrder,
  getOrders,
  getOrder,

  getOrdersForAdmin,
  getOrderForAdmin,
  updateOrderByAdmin,
};
