import { OrderService } from "./order.service.js";

export class OrderController {
  /**
   * @route POST /orders
   * @access Private
   */
  static async createOrder(req, res) {
    const { userId, email } = req.user;
    const { shippingAddress } = req.body;

    const orderDetails = await OrderService.createOrder({
      userId,
      email,
      shippingAddress,
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: orderDetails,
    });
  }

  /**
   * @route GET /orders
   * @access Private
   */
  static async getUserOrders(req, res) {
    const { userId } = req.user;
    const { orders, pagination } = await OrderService.getUserOrders(
      userId,
      req.query,
    );

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
      pagination,
    });
  }

  /**
   * @route GET /orders/:id
   * @access Private
   */
  static async getUserOrderById(req, res) {
    const { id: orderId } = req.params;
    const { userId } = req.user;

    const order = await OrderService.getUserOrderById(userId, orderId);

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  }

  /**
   * @route PATCH /orders/:id
   * @access Private
   */
  static async cancelOrder(req, res) {
    const { id: orderId } = req.params;
    const { userId } = req.user;

    const order = await OrderService.cancelOrder(userId, orderId);

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  }

  /**
   * @route GET /orders/:id/refunds
   * @access Private
   */
  static async getOrderRefunds(req, res) {
    const { id: orderId } = req.params;
    const user = req.user;

    const refundDetails = await OrderService.getOrderRefunds(orderId, user);

    return res.status(200).json({
      success: true,
      message: "Order refunds fetched successfully",
      data: refundDetails,
    });
  }

  /**
   * @route GET /admin/orders
   * @access Private
   */
  static async adminGetOrders(req, res) {
    const { orders, pagination } = await OrderService.adminGetOrders(req.query);

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
      pagination,
    });
  }

  /**
   * @route GET /admin/orders/:id
   * @access Private
   */
  static async adminGetOrderById(req, res) {
    const { id: orderId } = req.params;

    const order = await OrderService.adminGetOrderById(orderId);

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  }

  /**
   * @route PATCH /admin/orders/:id
   * @access Private
   */
  static async adminUpdateShippingStatus(req, res) {
    const { id: orderId } = req.params;
    const { userId } = req.user;
    const { shippingStatus } = req.body;

    const updatedOrder = await OrderService.adminUpdateShippingStatus(
      orderId,
      userId,
      shippingStatus,
    );

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  }
}
