import {
  PAYMENT_STATUS,
  ORDER_STATUS,
  SHIPPING_STATUS,
  VALID_ORDER_SORT_FIELDS_FOR_ADMIN_LIST,
} from "../../../constants/order.js";

/**
 * @param {{ page?: number, limit?: number }} query
 * @returns {{ page: number, limit: number, skip: number }}
 */
export const buildOrderPagination = (query) => {
  let { page = 1, limit = 10 } = query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;

  limit = Math.min(limit, 50);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

/**
 * @param {{ search?: string, paymentStatus?: string, orderStatus?: string, shippingStatus?: string }} query
 * @returns {object}
 */
export const buildOrderFilter = (query) => {
  const filters = {};
  const {
    search = null,
    paymentStatus = null,
    orderStatus = null,
    shippingStatus = null,
  } = query;
  console.log(query.search, "is search");

  if (search) {
    if (search.toLowerCase().startsWith("ek-")) {
      filters.orderId = { $regex: search, $options: "i" };
    } else {
      filters.email = { $regex: search, $options: "i" };
    }
  }

  if (paymentStatus && Object.values(PAYMENT_STATUS).includes(paymentStatus)) {
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
};

/**
 * @param {{ sort?: string }} query
 * @returns {object}
 */
export const buildSortFilter = (query) => {
  const { sort = null } = query;
  const sortFilters = {};

  if (!sort) {
    sortFilters.createdAt = -1;
    return sortFilters;
  }

  const allSortFields = sort.split(",");
  const validSortFields = allSortFields.filter((field) =>
    VALID_ORDER_SORT_FIELDS_FOR_ADMIN_LIST.includes(field),
  );

  validSortFields.forEach((e) => {
    const isDesc = e.startsWith("-") ? -1 : 1;
    const field = isDesc === -1 ? e.slice(1) : e;

    sortFilters[field] = isDesc;
  });

  if (!sortFilters.createdAt) {
    sortFilters.createdAt = -1;
  }

  return sortFilters;
};
