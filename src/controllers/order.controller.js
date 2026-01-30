const {
  getUserOrders,
  getOrders,
  updateOrder,
  createOrder,
} = require("../services/order.service");

const createOrderController = async (req, res) => {
  const { uid: userId, email } = req.user;
  const { items } = req.body; // [{id, quantity}]

  const order = await createOrder({ userId, email, items });
  return res.status(200).json({ orderId: order._id, subTotal: order.subTotal });
};

/**
 * Only retrieves the user orders
 */
const getOrdersForUserController = async (req, res) => {
  const { uid } = req.user;
  const orders = await getUserOrders(uid);
  res.status(200).json(orders);
};

/**
 * Retrives all orders
 */
const getOrdersForAdminController = async (req, res) => {
  const orders = await getOrders();
  res.status(200).json({
    orders,
    size: orders.length,
  });
};

/**
 * Updates a specific Order
 */
const updateOrderController = async (req, res) => {
  const { id } = req.params;
  const { orderStatus } = req.body;
  const { uid } = req.user;

  const updatedOrder = await updateOrder(id, uid, {
    orderStatus,
  });

  res.status(200).json(updatedOrder);
};

module.exports = {
  getOrdersForUserController,
  getOrdersForAdminController,
  updateOrderController,
  createOrderController,
};
