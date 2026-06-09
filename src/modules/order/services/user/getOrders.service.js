import OrderModel from "../../../../models/Order/Order.model.js";

/**
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export const getOrders = async (userId) => {
  const orders = await OrderModel.find(
    { userId },
    {
      orderId: 1,
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
