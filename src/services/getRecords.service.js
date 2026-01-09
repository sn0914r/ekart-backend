const { db } = require("../configs/firebase.config");
const AppError = require("../errors/AppError");

const getRecords = async (isAdmin = false, uid) => {
  if (!isAdmin && !uid) {
    throw new AppError("Unauthorized", 401);
  }
  try {
    const snapshot = isAdmin
      ? db.collection("orders").orderBy("createdAt", "desc").get()
      : db
          .collection("orders")
          .where("userId", "==", uid)
          .orderBy("createdAt", "desc")
          .get();

    const orderSnapshot = await snapshot;

    const orders = isAdmin
      ? orderSnapshot.docs.map((doc) => ({
          orderId: doc.id,
          ...doc.data(),
        }))
      : orderSnapshot.docs.map((doc) => {
          const {
            items,
            orderStatus,
            paymentStatus,
            totalAmount,
            shippingStatus,
          } = doc.data();
          const orderId = doc.id;

          return {
            orderId,
            items,
            orderStatus,
            paymentStatus,
            totalAmount,
            shippingStatus,
          };
        });
    return orders;
  } catch (error) {
    throw new AppError(error.message, 500);
  }
};

module.exports = getRecords;
