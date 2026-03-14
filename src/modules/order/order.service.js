const AppError = require("../../errors/AppError");

const OrderModel = require("../../models/Order.model");
const ProductModel = require("../../models/Product.model");

const validateOrderStatusTransistion = require("./validateOrderTransistion");
const validateShippingStatusTransition = require("./validateShippingTransistion");

/**
 * @desc Creates an Order
 *
 * Side Effects:
 *  - Creates a new order record
 *
 * @returns {<Promise Order>} The created order
 * @throws {AppError} If item is out of stock
 */
const createOrder = async ({ userId, email, items, shippingAddress }) => {
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

  // Shipping History
  const shippingStatusHistory = [
    {
      status: "PENDING",
      at: new Date(),
      by: userId,
    },
  ];

  const order = await OrderModel.create({
    userId,
    email,
    orderSnapshot,
    subTotal,
    orderStatusHistory,
    shippingStatusHistory,
    shippingAddress,
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
 * @desc Updates order
 *
 * Behaviour:
 *  Admin:
 *    - Can update shipping status
 *  User:
 *    - Can update order status (cancel only, before shippingF)
 *    - Can update shipping address
 *
 * Side Effects:
 *  - Updates order document
 *  - Appends order and shipping status history
 *
 * Fails when:
 *  - Order not found
 *  - Order status transition is invalid
 *  - Shipping status transition is invalid
 *
 * @returns {Promise<Order>} updated order
 */
const updateOrder = async ({
  id,
  orderStatus,
  shippingAddress,
  shippingStatus,
  uid,
  role,
}) => {
  const order = await OrderModel.findById(id);

  if (!order) throw new AppError("Order not found", 404);

  if (role === "admin") {
    if (!shippingStatus) {
      throw new AppError("Shipping status is required", 400);
    }

    if (orderStatus) {
      throw new AppError("Order status cannot be changed by admin", 400);
    }

    validateShippingStatusTransition(order.shippingStatus, shippingStatus);
    order.shippingStatus = shippingStatus;
    order.shippingStatusHistory.push({
      status: shippingStatus,
      at: new Date(),
      by: uid,
    });
    await order.save();
    return order;
  }

  if (orderStatus) {
    validateOrderStatusTransistion(order.orderStatus, orderStatus);
    order.orderStatus = orderStatus;
    order.orderStatusHistory.push({
      status: orderStatus,
      at: new Date(),
      by: uid,
    });
  }

  if (shippingAddress) {
    order.shippingAddress = shippingAddress;
  }

  await order.save();

  return order;
};

const getOrder = async (id) => {
  const order = await OrderModel.findById(id);
  if (!order) throw new AppError("Order not found", 404);
  return order;
};

module.exports = {
  getOrders,
  updateOrder,
  createOrder,
  getOrder,
};
