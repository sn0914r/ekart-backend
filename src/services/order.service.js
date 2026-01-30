const AppError = require("../errors/AppError");
const OrderModel = require("../models/Order.model");
const validateOrderStatusTransistion = require("../utils/validateOrderTransistion");

/**
 * Retrives the user's orders based on UID
 */
const getUserOrders = async (uid) => {
  const orders = await OrderModel.find(
    { userId: uid },
    {
      createdAt: 1,
      orderStatus: 1,
      paymentStatus: 1,
      "paymentDetails.razorpayPaymentId": 1,
      "paymentDetails.razorpayOrderId": 1,
      orderSnapshot: 1,
    },
  );

  return orders;
};

/**
 * Retrives all orders
 */
const getOrders = async () => {
  const orders = await OrderModel.find({});
  return orders;
};

/**
 * Updates an order
 */

const updateOrder = async (id, adminUID, { orderStatus }) => {
  const order = await OrderModel.findById(id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  const currentStatus = order.orderStatus;
  validateOrderStatusTransistion(currentStatus, orderStatus);
  order.orderStatus = orderStatus;
  order.orderStatusHistory.push({
    status: orderStatus,
    at: new Date(),
    by: adminUID,
  });

  await order.save();

  return order;
};

module.exports = {
  getUserOrders,
  getOrders,
  updateOrder,
};
