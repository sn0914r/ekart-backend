const AppError = require("../errors/AppError");

const OrderModel = require("../models/Order.model");
const ProductModel = require("../models/Product.model");

const validateOrderStatusTransistion = require("../utils/validateOrderTransistion");

/**
 * @desc Creates an Order
 *
 * Side Effects:
 *  - Creates a new order record
 *
 * @returns {<Promise Order>} The created order
 * @throws {AppError} If item is out of stock
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
 * @desc Retrieves orders for the authenticated user or admin
 *
 * Behaviour:
 *  - Admin users can see all orders
 *  - Non-admin users can only see their orders
 * 
 * @returns {<Promise Order[]>} Orders
 */
const getOrders = async ({ uid, role }) => {
  const orders = await (role === "admin"
    ? OrderModel.find({})
    : OrderModel.find({ userId: uid }));
  return orders;
};

/**
 * @desc Updates order status
 *
 * Side Effects:
 *  - Updates order status and order status history
 *
 * @returns {<Promise Order>} updated order
 * @throws {AppError} If order not found or status transition is invalid
 */
const updateOrder = async ({ id, adminId, orderStatus }) => {
  const order = await OrderModel.findById(id);

  if (!order) throw new AppError("Order not found", 404);

  const currentStatus = order.orderStatus;
  validateOrderStatusTransistion(currentStatus, orderStatus);

  order.orderStatus = orderStatus;
  order.orderStatusHistory.push({
    status: orderStatus,
    at: new Date(),
    by: adminId,
  });
  await order.save();

  return order;
};

module.exports = {
  getOrders,
  updateOrder,
  createOrder,
};
