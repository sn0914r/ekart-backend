const { db, admin } = require("../configs/firebase.config");
const { createDoc, getDocs, updateDoc, getDoc } = require("../db/db.helpers");
const validateOrderStatusTransistion = require("../utils/validateOrderTransistion");

const createOrder = async (orderDetails) => {
  const ref = await createDoc("orders", orderDetails);
  return ref;
};

/**
 * Retrives the user's orders based on UID
 */
const getUserOrders = async (uid) => {
  const snapshot = await db
    .collection("orders")
    .where("userId", "==", uid)
    .get();

  const orders = snapshot.docs.map((order) => {
    const { items, orderStatus, paymentStatus, totalAmount, shippingStatus } =
      order.data();

    return {
      id: order.id,
      items,
      orderStatus,
      paymentStatus,
      totalAmount,
      shippingStatus,
    };
  });

  return orders;
};

/**
 * Retrives all orders
 */
const getOrders = async () => {
  const orders = await getDocs("orders");
  return orders;
};

/**
 * Updates an order
 */

const updateOrder = async (id, adminUID, { orderStatus }) => {
  let currentStatus = await getDoc("orders", id);
  currentStatus = currentStatus.orderStatus;

  validateOrderStatusTransistion(currentStatus, orderStatus);

  const updates = {
    orderStatus,
    orderStatusHistory: admin.firestore.FieldValue.arrayUnion({
      status: orderStatus,
      at: new Date(),
      by: adminUID,
    }),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  const order = await updateDoc("orders", id, updates);
  return order;
};

module.exports = { createOrder, getUserOrders, getOrders, updateOrder };
