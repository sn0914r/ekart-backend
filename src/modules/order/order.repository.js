import mongoose from "mongoose";
import OrderModel from "#db/models/order.model.js";
import ProductModel from "#db/models/product.model.js";
import CartModel from "#db/models/cart.model.js";
import { ORDER } from "#constants/index.js";

const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  SHIPPING_STATUS,
  VALID_SORT_ORDER_FIELDS,
} = ORDER;

export class OrderRepository {
  /**
   * Normalizes pagination query params
   * @param {{ page?: string | number, limit?: string | number }} [query={}]
   * @returns {{ page: number, limit: number, skip: number }}
   */
  static #buildPagination(query = {}) {
    let { page = 1, limit = 10 } = query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    limit = Math.min(limit, 50);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Builds filter query for order listing
   * @param {object} [query={}]
   * @param {string|null} [userId=null]
   * @returns {Record<string, unknown>}
   */
  static #buildFilter(query = {}, userId = null) {
    const filters = {};

    if (userId) {
      filters.userId = userId;
    }

    const {
      search = null,
      paymentStatus = null,
      orderStatus = null,
      shippingStatus = null,
    } = query;

    if (search && search.trim()) {
      const trimmed = search.trim();
      if (trimmed.toLowerCase().startsWith("ek-")) {
        filters.orderId = { $regex: trimmed, $options: "i" };
      } else {
        filters.email = { $regex: trimmed, $options: "i" };
      }
    }

    if (
      paymentStatus &&
      Object.values(PAYMENT_STATUS).includes(paymentStatus)
    ) {
      filters.paymentStatus = paymentStatus;
    }

    if (orderStatus && Object.values(ORDER_STATUS).includes(orderStatus)) {
      filters.orderStatus = orderStatus;
    }

    if (
      shippingStatus &&
      Object.values(SHIPPING_STATUS).includes(shippingStatus)
    ) {
      filters.shippingStatus = shippingStatus;
    }

    return filters;
  }

  /**
   * Builds sort options for orders
   * @param {{ sort?: string }} [query={}]
   * @returns {Record<string, 1 | -1>}
   */
  static #buildSort(query = {}) {
    const { sort = null } = query;
    const sortOptions = {};

    if (!sort) {
      return { createdAt: -1 };
    }

    const sortFields = sort.split(",");
    const validSortFields = sortFields.filter((field) =>
      VALID_SORT_ORDER_FIELDS.includes(field.trim()),
    );

    validSortFields.forEach((field) => {
      const cleanField = field.trim();
      const isDesc = cleanField.startsWith("-") ? -1 : 1;
      const fieldName = isDesc === -1 ? cleanField.slice(1) : cleanField;

      sortOptions[fieldName] = isDesc;
    });

    if (!sortOptions.createdAt) {
      sortOptions.createdAt = -1;
    }

    return sortOptions;
  }

  /**
   * Finds paginated orders (supports user-scoped or admin queries)
   * @param {object} [query={}]
   * @param {{ userId?: string|null, projection?: object }} [options={}]
   * @returns {Promise<{ orders: object[], pagination: { page: number, limit: number, totalPages: number, totalOrders: number } }>}
   */
  static async findOrders(
    query = {},
    { userId = null, projection = null } = {},
  ) {
    const { page, limit, skip } = OrderRepository.#buildPagination(query);
    const filter = OrderRepository.#buildFilter(query, userId);
    const sort = OrderRepository.#buildSort(query);

    const defaultProjection = userId
      ? {
          orderId: 1,
          orderSnapshot: 1,
          shippingAddress: 1,
          orderStatus: 1,
          paymentStatus: 1,
          shippingStatus: 1,
          subTotal: 1,
          createdAt: 1,
        }
      : {
          orderId: 1,
          email: 1,
          subTotal: 1,
          paymentStatus: 1,
          shippingStatus: 1,
          orderStatus: 1,
          createdAt: 1,
        };

    const finalProjection = projection || defaultProjection;

    const [orders, totalOrders] = await Promise.all([
      OrderModel.find(filter, finalProjection)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(filter),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalOrders / limit) || 1,
        totalOrders,
      },
    };
  }

  /**
   * Finds order by custom orderId (EK-XXXXXX) or MongoDB _id, optionally scoped to userId
   * @param {string} orderId
   * @param {string|null} [userId=null]
   * @param {object|null} [projection=null]
   * @returns {Promise<object|null>}
   */
  static async findOrderById(orderId, userId = null, projection = null) {
    const query = orderId.startsWith("EK-") ? { orderId } : { _id: orderId };
    if (userId) {
      query.userId = userId;
    }

    let mongoQuery = OrderModel.findOne(query);
    if (projection) {
      mongoQuery = mongoQuery.select(projection);
    }

    return await mongoQuery.lean();
  }

  /**
   * Finds order eligible for cancellation
   * @param {string} orderId
   * @param {string|null} [userId=null]
   * @returns {Promise<object|null>}
   */
  static async findCancellableOrder(orderId, userId = null) {
    const query = {
      _id: orderId,
      isStockReverted: false,
      orderStatus: {
        $in: [ORDER_STATUS.CREATED, ORDER_STATUS.CONFIRMED],
      },
      shippingStatus: SHIPPING_STATUS.PENDING,
    };

    if (userId) {
      query.userId = userId;
    }

    return await OrderModel.findOne(query).lean();
  }

  /**
   * Creates an order document and clears user cart
   * @param {{
   *   userId: string,
   *   email: string,
   *   shippingAddress: object,
   *   orderSnapshot: object[],
   *   subTotal: number
   * }} orderData
   * @returns {Promise<object>}
   */
  static async createOrderAndClearCart({
    userId,
    email,
    shippingAddress,
    orderSnapshot,
    subTotal,
  }) {
    const orderStatusHistory = [
      { status: ORDER_STATUS.CREATED, at: new Date(), by: userId },
    ];

    const order = await OrderModel.create({
      userId,
      email,
      orderSnapshot,
      subTotal,
      orderStatusHistory,
      shippingAddress,
    });

    await CartModel.updateOne({ userId }, { $set: { items: [] } });

    return order.toObject();
  }

  /**
   * Cancels order and restores product stock inside a MongoDB transaction
   * @param {string} orderId
   * @param {string} userId
   * @param {{
   *   targetPaymentStatus: string,
   *   refundData?: object|null,
   *   isPaid: boolean,
   *   orderSnapshot: object[]
   * }} params
   * @returns {Promise<{ cancelledOrder: object, updatedProductIds: string[] }>}
   */
  static async cancelOrderWithStockRestoration(
    orderId,
    userId,
    { targetPaymentStatus, refundData = null, isPaid = false, orderSnapshot },
  ) {
    const session = await mongoose.startSession();
    const updatedProductIds = [];

    try {
      session.startTransaction();

      const pushUpdates = {
        orderStatusHistory: {
          status: ORDER_STATUS.CANCELLED,
          at: new Date(),
          by: userId,
        },
        paymentStatusHistory: {
          status: targetPaymentStatus,
          at: new Date(),
          by: userId,
        },
      };

      if (refundData) {
        pushUpdates["paymentDetails.refunds"] = {
          refundId: refundData.refundId,
          gatewayRefundId: refundData.gatewayRefundId,
          amountInRupees: refundData.amountInRupees,
          status: refundData.status,
          reason: refundData.reason || "Order cancelled by customer",
          createdAt: refundData.createdAt || new Date(),
        };
      }

      const cancelledOrder = await OrderModel.findByIdAndUpdate(
        orderId,
        {
          $set: {
            isStockReverted: true,
            orderStatus: ORDER_STATUS.CANCELLED,
            shippingStatus: SHIPPING_STATUS.CANCELLED,
            paymentStatus: targetPaymentStatus,
          },
          $push: pushUpdates,
        },
        {
          returnDocument: "after",
          session,
        },
      ).lean();

      if (isPaid && orderSnapshot?.length > 0) {
        const bulkOperations = orderSnapshot.map((item) => ({
          updateOne: {
            filter: { _id: item.productId },
            update: {
              $inc: { stock: item.quantity },
            },
          },
        }));

        await ProductModel.bulkWrite(bulkOperations, { session });
        orderSnapshot.forEach((item) =>
          updatedProductIds.push(item.productId.toString()),
        );
      }

      await session.commitTransaction();
      return { cancelledOrder, updatedProductIds };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Updates shipping status and pushes status history
   * @param {string} orderId
   * @param {string} userId
   * @param {string} shippingStatus
   * @returns {Promise<object|null>}
   */
  static async updateShippingStatus(orderId, userId, shippingStatus) {
    return await OrderModel.findByIdAndUpdate(
      orderId,
      {
        $set: { shippingStatus },
        $push: {
          shippingStatusHistory: {
            status: shippingStatus,
            at: new Date(),
            by: userId,
          },
        },
      },
      { returnDocument: "after" },
    ).lean();
  }

  /**
   * Fetches multiple products by IDs (used for checkout validation and snapshot)
   * @param {string[]} productIds
   * @returns {Promise<object[]>}
   */
  static async findProductsForOrder(productIds) {
    return await ProductModel.find({ _id: { $in: productIds } }).lean();
  }

  /**
   * Fetches user's cart for checkout
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  static async findCartByUserId(userId) {
    return await CartModel.findOne({ userId }).lean();
  }
}
