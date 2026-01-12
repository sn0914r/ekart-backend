const { db } = require("../configs/firebase.config");
const { createDoc, getDocs, updateDoc } = require("../db/db.helpers");

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

const updateOrder = async (id, updates) => {
  const order = await updateDoc("orders", id, updates);
  return order;
};

module.exports = { createOrder, getUserOrders, getOrders, updateOrder };
