import {
  buildOrderFilter,
  buildOrderPagination,
  buildSortFilter,
} from "#modules/order/helpers/order.query.js";
import OrderModel from "../../OrderModel/order.model.js";

/**
 * @typedef {object} OrderListItem
 * @property {string} _id
 * @property {string} orderId
 * @property {object[]} orderSnapshot
 * @property {object} shippingAddress
 * @property {string} orderStatus
 * @property {string} paymentStatus
 * @property {string} shippingStatus
 * @property {number} subTotal
 * @property {Date} createdAt
 */

/**
 * @param {string} userId
 * @returns {Promise<OrderListItem[]>}
 */
export const getOrders = async (userId, query = {}) => {
  const { page, limit, skip } = buildOrderPagination(query);
  // const orderFilters = buildOrderFilter(query);
  const orderSortFilter = buildSortFilter(query);

  const orders = await OrderModel.find(
    { userId },
    {
      orderId: 1,
      orderSnapshot: 1,
      shippingAddress: 1,
      orderStatus: 1,
      paymentStatus: 1,
      shippingStatus: 1,
      subTotal: 1,
      createdAt: 1,
    },
  )
    .skip(skip)
    .limit(limit)
    .sort(orderSortFilter);

  const totalDocuments = await OrderModel.countDocuments({ userId });

  return {
    orders,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalDocuments / limit),
      totalOrders: totalDocuments,
    },
  };
};
