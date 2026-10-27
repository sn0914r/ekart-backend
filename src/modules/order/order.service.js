import { ORDER, ERROR_CODES, ROLES } from "#constants/index.js";
import { AppError } from "#errors/AppError.js";
import { emailQueue } from "#queues/email.queue.js";
import { redisClient } from "#clients/redis.js";
import { PaymentOrchestratorProvider } from "#providers/paymentOrchestrator.provider.js";
import { logger } from "#utils/logger.js";
import { OrderRepository } from "./order.repository.js";

const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  TRANSITIONS_ORDER: { SHIPPING_TRANSITIONS },
} = ORDER;

export class OrderService {
  /**
   * @param {{ userId: string, email: string, shippingAddress: object }} params
   * @returns {Promise<{ orderId: string, subTotal: number }>}
   */
  static async createOrder({ userId, email, shippingAddress }) {
    const cart = await OrderRepository.findCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is Empty", 400, ERROR_CODES.BAD_REQUEST_ERROR);
    }

    const productIds = cart.items.map((i) => i.productId);
    const products = await OrderRepository.findProductsForOrder(productIds);
    const orderSnapshot = OrderService.#prepareOrderSnapshot(cart, products);
    const totalAmount = orderSnapshot.reduce(
      (sum, item) => sum + item.lineTotal,
      0,
    );

    const order = await OrderRepository.createOrderAndClearCart({
      userId,
      email,
      shippingAddress,
      orderSnapshot,
      subTotal: totalAmount,
    });

    return { orderId: order._id, subTotal: order.subTotal };
  }

  /**
   * @param {string} userId
   * @param {object} [query={}]
   * @returns {Promise<{ orders: object[], pagination: object }>}
   */
  static async getUserOrders(userId, query = {}) {
    return await OrderRepository.findOrders(query, { userId });
  }

  /**
   * @param {string} userId
   * @param {string} orderId
   * @returns {Promise<object>}
   */
  static async getUserOrderById(userId, orderId) {
    return await OrderService.#getOrderWithTimeline(orderId, userId);
  }

  /**
   * @param {object} [query={}]
   * @returns {Promise<{ orders: object[], pagination: object }>}
   */
  static async adminGetOrders(query = {}) {
    return await OrderRepository.findOrders(query);
  }

  /**
   * @param {string} orderId
   * @returns {Promise<object>}
   */
  static async adminGetOrderById(orderId) {
    return await OrderService.#getOrderWithTimeline(orderId);
  }

  /**
   * @param {string} userId
   * @param {string} orderId
   * @returns {Promise<object>}
   */
  static async cancelOrder(userId, orderId) {
    const existingOrder = await OrderRepository.findCancellableOrder(
      orderId,
      userId,
    );

    if (!existingOrder) {
      const exists = await OrderRepository.findOrderById(orderId, userId);
      throw new AppError(
        exists ? "Order cannot be cancelled" : "Order not found",
        404,
        ERROR_CODES.NOT_FOUND_ERROR,
      );
    }

    const isPaid =
      existingOrder.paymentStatus === PAYMENT_STATUS.PAID ||
      existingOrder.orderStatus === ORDER_STATUS.CONFIRMED;

    let refundData = null;
    if (isPaid && existingOrder.paymentDetails?.poePaymentId) {
      logger.info(`Automated refund for order ${orderId}`);
      refundData = await PaymentOrchestratorProvider.createRefund({
        paymentId: existingOrder.paymentDetails.poePaymentId,
        amountInRupees: existingOrder.subTotal,
        reason: "Order cancelled by customer",
        idempotencyKey: `cancel_refund_${orderId}`,
      });
    }

    const targetPaymentStatus = isPaid
      ? PAYMENT_STATUS.REFUNDED
      : PAYMENT_STATUS.CANCELLED;

    const { cancelledOrder, updatedProductIds } =
      await OrderRepository.cancelOrderWithStockRestoration(orderId, userId, {
        targetPaymentStatus,
        refundData,
        isPaid,
        orderSnapshot: existingOrder.orderSnapshot,
      });

    if (isPaid && updatedProductIds.length > 0) {
      await Promise.all(
        updatedProductIds.map((id) =>
          redisClient.del(`product:${id}`).catch(() => {}),
        ),
      );
    }

    const cancelEmail = ORDER.ORDER_STATUS_EMAILS_LABELS.CANCELLED;
    if (cancelledOrder.email) {
      await emailQueue.add("order-cancelled-email", {
        template: "order-cancelled",
        to: cancelledOrder.email,
        subject: cancelEmail.subject,
        payload: {
          orderId: cancelledOrder.orderId,
          message: cancelEmail.message,
        },
      });
    }

    return cancelledOrder;
  }

  /**
   * @param {string} orderId
   * @param {{ userId: string, role: string }} user
   * @returns {Promise<{ orderId: string, poePaymentId?: string, paymentStatus: string, refunds: object[] }>}
   */
  static async getOrderRefunds(orderId, user) {
    const scopedUserId = user.role === ROLES.USER ? user.userId : null;
    const order = await OrderRepository.findOrderById(orderId, scopedUserId);
    if (!order) {
      throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
    }

    const poePaymentId = order.paymentDetails?.poePaymentId;
    if (!poePaymentId) {
      return {
        orderId: order.orderId,
        paymentStatus: order.paymentStatus,
        refunds: [],
      };
    }

    try {
      const refunds =
        await PaymentOrchestratorProvider.getRefundsByPaymentId(poePaymentId);
      return {
        orderId: order.orderId,
        poePaymentId,
        paymentStatus: order.paymentStatus,
        refunds,
      };
    } catch (error) {
      logger.warn(`Failed to fetch fresh refunds from POE: ${error.message}`);
      return {
        orderId: order.orderId,
        poePaymentId,
        paymentStatus: order.paymentStatus,
        refunds: order.paymentDetails?.refunds || [],
      };
    }
  }

  /**
   * @param {string} orderId
   * @param {string} userId
   * @param {string} shippingStatus
   * @returns {Promise<{ shippingStatus: string }>}
   */
  static async adminUpdateShippingStatus(orderId, userId, shippingStatus) {
    const order = await OrderRepository.findOrderById(orderId);
    if (!order) {
      throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
    }

    const allowed = SHIPPING_TRANSITIONS[order.shippingStatus];
    if (
      order.shippingStatus !== shippingStatus &&
      (!allowed || !allowed.includes(shippingStatus))
    ) {
      throw new AppError(
        `Shipping status cannot be changed from ${order.shippingStatus} to ${shippingStatus}`,
        409,
        ERROR_CODES.BAD_REQUEST_ERROR,
      );
    }

    const updatedOrder = await OrderRepository.updateShippingStatus(
      orderId,
      userId,
      shippingStatus,
    );

    const emailConfig = ORDER.ORDER_STATUS_EMAILS_LABELS[shippingStatus];
    if (emailConfig && order.email) {
      await emailQueue.add("order-shipping-status-email", {
        template: "order-shipping-status-update",
        to: order.email,
        subject: emailConfig.subject,
        payload: {
          orderId: order.orderId,
          status: shippingStatus,
          message: emailConfig.message,
        },
      });
    }

    return { shippingStatus: updatedOrder.shippingStatus };
  }

  // --- Private Helpers ---

  /**
   * @param {string} orderId
   * @param {string|null} [userId=null]
   * @returns {Promise<object>}
   */
  static async #getOrderWithTimeline(orderId, userId = null) {
    const order = await OrderRepository.findOrderById(orderId, userId);
    if (!order) {
      throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
    }

    const timeline = OrderService.#createTimeline(order);

    if (userId) {
      const {
        orderStatusHistory,
        paymentStatusHistory,
        shippingStatusHistory,
        ...cleanOrder
      } = order;
      return { ...cleanOrder, timeline };
    }

    return { ...order, timeline };
  }

  /**
   * @param {object} cart
   * @param {object[]} products
   * @returns {object[]}
   */
  static #prepareOrderSnapshot(cart, products) {
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    return cart.items.map(({ productId, quantity }) => {
      const product = productMap.get(productId.toString());
      if (!product) {
        throw new AppError(
          `Product not available: ${productId}`,
          404,
          ERROR_CODES.NOT_FOUND_ERROR,
        );
      }
      if (product.stock < quantity) {
        throw new AppError(
          `Item (${product.name}) out of stock, available: ${product.stock}`,
          409,
          ERROR_CODES.BAD_REQUEST_ERROR,
        );
      }
      return {
        productId: product._id,
        quantity,
        name: product.name,
        unitPrice: product.price,
        imageUrl: product.images?.[0] || null,
        lineTotal: product.price * quantity,
      };
    });
  }

  /**
   * @param {{ paymentStatusHistory?: object[], orderStatusHistory?: object[], shippingStatusHistory?: object[] }} order
   * @returns {object[]}
   */
  static #createTimeline({
    paymentStatusHistory = [],
    orderStatusHistory = [],
    shippingStatusHistory = [],
  }) {
    const mapEvents = (history, type, labels) =>
      history.map(({ status, at }) => ({
        type,
        status,
        label: labels[status] || status,
        at,
      }));

    const paymentEvents =
      paymentStatusHistory.length > 1
        ? paymentStatusHistory.slice(1)
        : paymentStatusHistory;

    return [
      ...mapEvents(orderStatusHistory, "ORDER", ORDER.TIMELINE_LABELS.ORDER),
      ...mapEvents(
        shippingStatusHistory,
        "SHIPPING",
        ORDER.TIMELINE_LABELS.SHIPPING,
      ),
      ...mapEvents(paymentEvents, "PAYMENT", ORDER.TIMELINE_LABELS.PAYMENT),
    ].sort((a, b) => new Date(a.at) - new Date(b.at));
  }
}
