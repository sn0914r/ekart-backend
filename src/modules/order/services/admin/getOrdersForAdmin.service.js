import OrderModel from "../../../../models/Order/Order.model.js";
import {
  buildOrderFilter,
  buildOrderPagination,
  buildSortFilter,
} from "../../utils/query.utils.js";

/**
 * @param {{ page?: number, limit?: number, search?: string, paymentStatus?: string, orderStatus?:string, sort?: string, shippingStatus?: string }} query
 * @returns {Promise<{
 *   orders: object[],
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     totalPages: number,
 *     totalOrders: number
 *   }
 * }>}
 */
export const getOrdersForAdmin = async (query) => {
  const { page, limit, skip } = buildOrderPagination(query);
  const orderFilters = buildOrderFilter(query);
  const orderSortFilter = buildSortFilter(query);

  const orders = await OrderModel.find(orderFilters, {
    orderId: 1,
    email: 1,
    subTotal: 1,
    paymentStatus: 1,
    shippingStatus: 1,
    orderStatus: 1,
    createdAt: 1,
  })
    .skip(skip)
    .limit(limit)
    .sort(orderSortFilter);

  const totalDocuments = await OrderModel.countDocuments(orderFilters);

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
