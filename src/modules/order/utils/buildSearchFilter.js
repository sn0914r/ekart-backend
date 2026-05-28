const {
  PAYMENT_STATUS,
  ORDER_STATUS,
  SHIPPING_STATUS,
} = require("../../../constants/order");

const buildOrderFilter = (query) => {
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

module.exports = { buildOrderFilter };
