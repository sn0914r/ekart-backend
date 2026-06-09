import {
  getOrderForAdmin,
  getOrdersForAdmin,
  updateOrderByAdmin,
} from "../services/index.js";

/**
 * @route GET /admin/orders
 * @access Private
 */
export const getOrdersForAdminController = async (req, res) => {
  const { orders, pagination } = await getOrdersForAdmin(req.query);

  return res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    data: orders,
    pagination,
  });
};

/**
 * @route GET /admin/orders/:id
 * @access Private
 */
export const getOrderForAdminController = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await getOrderForAdmin(orderId);

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
export const updateOrderByAdminController = async (req, res) => {
  const { id: orderId } = req.params;
  const { userId } = req.user;
  const shippingStatus = req.body?.shippingStatus;

  const updatedOrder = await updateOrderByAdmin(
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
