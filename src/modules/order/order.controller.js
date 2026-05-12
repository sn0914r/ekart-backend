const Service = require("./services/order.service")

/**
 * @route POST /orders
 * @access Private
 */
const createOrderController = async (req, res) => {
  const { userId, email } = req.user;
  const { shippingAddress } = req.body;

  const orderDetails = await Service.createOrder(userId, email, shippingAddress);
  return res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: orderDetails,
  });
};

/**
 * @route GET /orders
 * @access Private
 */
const getOrdersController = async (req, res) => {
  const { userId } = req.user;

  const orders = await Service.getOrders(userId);
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
const updateOrderController = async (req, res) => {
  const { id: orderId } = req.params;
  const { userId } = req.user;

  const orderStatus = req.body?.orderStatus;
  const shippingAddress = req.body?.shippingAddress;

  const order = await Service.updateOrder(orderId, userId, {
    orderStatus,
    shippingAddress,
  });

  res.status(200).json({
    success: true,
    message: "Order updated successfully",
    data: order,
  });
};

/**
 * @route GET /orders/:id
 * @access Private
 */
const getOrderController = async (req, res) => {
  const { id: orderId } = req.params;
  const { userId } = req.user;

  const order = await Service.getOrder(userId, orderId);

  return res.status(200).json({
    success: true,
    message: "Order fetched successfully",
    data: order,
  });
};

// ======================================== ADMIN ========================================

/**
 * @route GET /admin/orders
 * @access Private
 */
const getOrdersForAdminController = async (req, res) => {
  const orders = await Service.getOrdersForAdmin();

  return res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    data: orders,
  });
};

/**
 * @route GET /admin/orders/:id
 * @access Private
 */
const getOrderForAdminController = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Service.getOrderForAdmin(orderId);

  res.status(200).json({
    success: true,
    message: "Order fetched successfully",
    data: order,
  });
};

/**
 * @route PATCH /admin/orders/:id
 * @access Private
 * @desc Updates Shipping status
 */
const updateOrderByAdminController = async (req, res) => {
  const { id: orderId } = req.params;
  const { userId } = req.user;
  const shippingStatus = req.body?.shippingStatus;

  const updatedOrder = await Service.updateOrderByAdmin(
    orderId,
    userId,
    shippingStatus,
  );

  res.status(200).json({
    success: true,
    message: "Order updated successfully",
    data: updatedOrder,
  });
};
module.exports = {
  createOrderController,
  updateOrderController,
  getOrdersController,
  getOrderController,

  getOrderForAdminController,
  getOrdersForAdminController,
  updateOrderByAdminController,
};
