import {
  createOrder,
  getOrder,
  getOrders,
  updateOrderStatus,
} from "../services/index.js";

/**
 * @route POST /orders
 * @access Private
 */
export const createOrderController = async (req, res) => {
  const { userId, email } = req.user;
  const { shippingAddress } = req.body;

  const orderDetails = await createOrder(userId, email, shippingAddress);

  return res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: orderDetails,
  });
};

/**
 * @route GET /orders/:id
 * @access Private
 */
export const getOrderController = async (req, res) => {
  const { id: orderId } = req.params;
  const { userId } = req.user;

  const order = await getOrder(userId, orderId);

  return res.status(200).json({
    success: true,
    message: "Order fetched successfully",
    data: order,
  });
};

/**
 * @route GET /orders
 * @access Private
 */
export const getOrdersController = async (req, res) => {
  const { userId } = req.user;

  const orders = await getOrders(userId);

  return res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    data: orders,
  });
};

/**
 * @route PATCH /orders/:id
 * @access Private
 * @desc Updates order status
 */
export const updateOrderStatusController = async (req, res) => {
  const { id: orderId } = req.params;
  const { userId } = req.user;

  const orderStatus = req.body?.orderStatus;

  const order = await updateOrderStatus(orderId, userId, { orderStatus });

  res.status(200).json({
    success: true,
    message: "Order updated successfully",
    data: order,
  });
};
