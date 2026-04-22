const { logger } = require("../../utils/logger");
const {
  createOrder,
  getOrders,
  updateOrder,
  getOrdersForAdmin,
  getOrderForAdmin,
  updateOrderByAdmin,
  getOrder,
} = require("./order.service");

/**
 * @route POST /orders
 * @access Private
 */
const createOrderController = async (req, res) => {
  const { uid: userId, email } = req.user;
  const { items, shippingAddress } = req.body;

  const orderDetails = await createOrder({
    userId,
    email,
    items,
    shippingAddress,
  });
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
  const { uid } = req.user;
  const orders = await getOrders({ uid });
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
  const { id } = req.params;
  const { uid } = req.user;

  const orderStatus = req.body?.orderStatus;
  const shippingAddress = req.body?.shippingAddress;

  const updatedOrder = await updateOrder({
    id,
    uid,
    orderStatus,
    shippingAddress,
  });

  res.status(200).json({
    success: true,
    message: "Order updated successfully",
    data: updatedOrder,
  });
};

/**
 * @route GET /orders/:id
 * @access Private
 */
const getOrderController = async (req, res) => {
  const { id } = req.params;
  const { uid } = req.user;

  const order = await getOrder({ uid, id });

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
  const orders = await getOrdersForAdmin();

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
  const { id } = req.params;
  const order = await getOrderForAdmin(id);

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
  const { id } = req.params;
  const { uid } = req.user;
  const shippingStatus = req.body?.shippingStatus;

  const updatedOrder = await updateOrderByAdmin({
    id,
    uid,
    shippingStatus,
  });

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
