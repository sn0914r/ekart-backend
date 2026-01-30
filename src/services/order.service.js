const AppError = require("../errors/AppError");
const OrderModel = require("../models/Order.model");
const ProductModel = require("../models/Product.model");
const validateOrderStatusTransistion = require("../utils/validateOrderTransistion");

/**
 * Creates an Order
 *
 * Flow:-
 *  1. fetches the target products
 *  2. checks the stock
 *  3. creates a snapshot
 *  4. calculates total Amount
 *  5. Creates an order with Orderstatus: "CREATED" & paymentStatus: "PENDING"
 * 
 */
const createOrder = async ({ userId, email, items }) => {
  const idsToQtyMap = Object.fromEntries(
    items.map(({ id, quantity }) => [id, quantity]),
  );
  const productIds = Object.keys(idsToQtyMap);

  const requiredItems = await ProductModel.find(
    { _id: { $in: productIds } },
    { isActive: 1, stock: 1, name: 1, price: 1 },
  );

  // Checking the stock
  requiredItems.forEach((item) => {
    if (item.stock < idsToQtyMap[item._id]) {
      throw new AppError(
        `Item (${item.name}) out of stock, available: ${item.stock}`,
        400,
      );
    }
  });

  const orderSnapshot = requiredItems.map((item) => ({
    productId: item._id,
    quantity: idsToQtyMap[item._id],
    name: item.name,
    unitPrice: item.price,
    lineTotal: item.price * idsToQtyMap[item._id],
  }));

  const subTotal = orderSnapshot.reduce((acc, item) => acc + item.lineTotal, 0);

  // Order History
  const orderStatusHistory = [
    {
      status: "CREATED",
      at: new Date(),
      by: userId,
    },
  ];

  const order = await OrderModel.create({
    userId,
    email,
    orderSnapshot,
    subTotal,
    orderStatus: "CREATED",
    orderStatusHistory,
  });
  return order;
};

/**
 * Retrives the user's orders based on UID
 */
const getUserOrders = async (uid) => {
  const orders = await OrderModel.find(
    { userId: uid },
    {
      createdAt: 1,
      orderStatus: 1,
      paymentStatus: 1,
      "paymentDetails.razorpayPaymentId": 1,
      "paymentDetails.razorpayOrderId": 1,
      orderSnapshot: 1,
    },
  );

  return orders;
};

/**
 * Retrives all orders
 */
const getOrders = async () => {
  const orders = await OrderModel.find({});
  return orders;
};

/**
 * Updates an order
 */

const updateOrder = async (id, adminUID, { orderStatus }) => {
  const order = await OrderModel.findById(id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  const currentStatus = order.orderStatus;
  validateOrderStatusTransistion(currentStatus, orderStatus);
  order.orderStatus = orderStatus;
  order.orderStatusHistory.push({
    status: orderStatus,
    at: new Date(),
    by: adminUID,
  });

  await order.save();

  return order;
};

module.exports = {
  getUserOrders,
  getOrders,
  updateOrder,
  createOrder,
};
