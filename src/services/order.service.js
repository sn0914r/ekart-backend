const { db, admin } = require("../configs/firebase.config");
const { createDoc, getDocs, updateDoc, getDoc } = require("../db/db.helpers");
const AppError = require("../errors/AppError");
const OrderModel = require("../models/Order.model");
const validateOrderStatusTransistion = require("../utils/validateOrderTransistion");

// TODO: to be removed
const createOrder = async (orderDetails) => {
  // TODO: to be removed
  const ref = await createDoc("orders", orderDetails);
  // const order =
  return ref;
};

/**
 * Retrives the user's orders based on UID
 */
const getUserOrders = async (uid) => {
  // TODO: to be removed
  // const snapshot = await db
  //   .collection("orders")
  //   .where("userId", "==", uid)
  //   .get();

  // const orders = snapshot.docs.map((order) => {
  //   const {
  //     items,
  //     orderSnapshot,
  //     orderStatus,
  //     paymentStatus,
  //     paymentDetails,
  //     createdAt,
  //   } = order.data();

  //   return {
  //     id: order.id,
  //     createdAt,
  //     items,
  //     orderStatus,
  //     paymentStatus,
  //     paymentId: paymentDetails.razorpayPaymentId,
  //     totalAmount: orderSnapshot.subtotal,
  //   };
  // });

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
  // let currentStatus = await getDoc("orders", id);
  // currentStatus = currentStatus.orderStatus;

  // const updates = {
  //   orderStatus,
  //   orderStatusHistory: admin.firestore.FieldValue.arrayUnion({
  //     status: orderStatus,
  //     at: new Date(),
  //     by: adminUID,
  //   }),
  //   updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  // };
  // const order = await updateDoc("orders", id, updates);

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
  })

  await order.save();

  return order;
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrders,
  updateOrder,
};
