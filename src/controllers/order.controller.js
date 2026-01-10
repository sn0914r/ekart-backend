const {
  getUserOrders,
  getOrders,
  updateOrder,
} = require("../services/order.service");

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
  return orders;
};

/**
 * Updates a specific Order
 */
const updateOrderController = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updatedOrder = await updateOrder(id, updates);

  res.status(200).json(updatedOrder);
};

module.exports = {
  getOrdersForUserController,
  getOrdersForAdminController,
  updateOrderController,
};
