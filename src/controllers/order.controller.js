const orderService = require("../services/order.service");

/**
 * @desc Creates a new order for the authenticated user
 *
 * Preconditions:
 *  - Request is authenticated
 *  - req.body contains the validated cart items - [{id, quantity}]
 *
 * @route POST /orders
 * @access Private
 */
const createOrderController = async (req, res) => {
  const { uid: userId, email } = req.user;
  const { items, shippingAddress } = req.body;

  const order = await orderService.createOrder({
    userId,
    email,
    items,
    shippingAddress,
  });
  return res.status(201).json({ orderId: order._id, subTotal: order.subTotal });
};

/**
 * @desc Retrieves all orders for the authenticated user or admin
 *
 * Preconditions:
 *  - Request is authenticated
 *  - req.user.role is either "user" or "admin"
 *
 * @route GET /orders
 * @route GET /admin/orders
 * @access Private
 */
const getOrdersController = async (req, res) => {
  const { uid, role } = req.user;
  const orders = await orderService.getOrders({ uid, role });
  return res.status(200).json(orders);
};

/**
 * @desc Updates order status
 *
 * Preconditions:
 *  - Request is authenticated
 *  - req.user.role is "admin"
 *  - req.params.id is valid
 *  - req.body.orderStatus is valid
 *
 * @route PATCH /admin/orders/:id
 * @access Private
 */
const updateOrderController = async (req, res) => {
  const { id } = req.params;

  const orderStatus = req.body.orderStatus;
  const shippingAddress = req.body.shippingAddress;

  const shippingStatus = req.body.shippingStatus;

  const uid = req.user.uid;
  const role = req.user.role;

  const updatedOrder = await orderService.updateOrder({
    id,
    orderStatus,
    shippingAddress,
    shippingStatus,
    uid,
    role,
  });

  res.status(200).json(updatedOrder);
};

const getOrderController = async (req, res) => {
  const { id } = req.params;
  const order = await orderService.getOrder(id);
  res.status(200).json(order);
};

module.exports = {
  createOrderController,
  updateOrderController,
  getOrdersController,
  getOrderController,
};
