const crypto = require("crypto");

const razorpay = require("../configs/razorpay.config");

const { calculateCartTotal } = require("./pricing.service");
const AppError = require("../errors/AppError");

const { sendOrderConfirmation } = require("./email.service");
const { checkStock } = require("./product.service");
const { admin, db } = require("../configs/firebase.config");

/**
 * Creates an order at razorpay server
 */
const createPaymentOrder = async (items, uid) => {
  await checkStock(items);
  const totalAmount = await calculateCartTotal(items);

  const options = {
    amount: totalAmount * 100,
    currency: "INR",
    receipt: `receipt_${uid.slice(0, 5)}_${Date.now()}`,
  };

  // NOTE: the razorpay receipt must be lessthan 40 chars
  const order = await razorpay.orders.create(options);
  return order;
};

/**
 * Service Entry point for VerifyPaymentController
 *
 * Flow:
 *  - Check payment already processed or not
 *  - Verifies the signatures
 *  - Calculates total Amount
 *  - Checks stock
 *  - Reduces stock
 *  - Creates Order
 *  - Creates Payment Record
 *  - Notifies the customer
 *
 * @returns {string} - Order Id
 */
const handlePaymentsAndOrder = async ({
  razorpaySignature,
  razorpayOrderId,
  razorpayPaymentId,

  userId,
  email,

  items,
}) => {
  const orderRef = db.collection("payments").doc(razorpayPaymentId);
  const snap = await orderRef.get();
  if (snap.exists) {
    throw new AppError(`Payment already processed: ${snap.id}`, 400);
  }

  console.log("didnt exist");

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_TEST_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  if (generatedSignature !== razorpaySignature) {
    throw new AppError("Invalid payment", 400);
  }

  const totalAmount = await calculateCartTotal(items);

  /**
   * Firestore Transaction Rule:
   * Do all reads (transaction.get) first,
   * then do all writes (transaction.update/set/delete).
   */
  const { orderId, paymentId } = await db.runTransaction(
    async (transaction) => {
      const productSnaps = [];

      // READS
      for (const item of items) {
        const productRef = db.collection("products").doc(item.id);
        const snap = await transaction.get(productRef);

        if (!snap.exists) {
          throw new AppError(`Product (${item.id}) not found`, 404);
        }

        const product = snap.data();
        if (product.stock < item.quantity) {
          throw new AppError(`Product (${product.name}) out of stock`, 400);
        }

        productSnaps.push({ productRef, item, product });
      }

      // WRITES

      for (const { productRef, item, product } of productSnaps) {
        transaction.update(productRef, {
          stock: product.stock - item.quantity,
        });
      }

      const orderRef = db.collection("orders").doc();
      transaction.set(orderRef, {
        userId,
        email,
        items,
        totalAmount,
        paymentDetails: {
          razorpayOrderId,
          razorpaySignature,
          razorpayPaymentId,
        },
        orderStatus: "created",
        shippingStatus: "pending",
        currency: "INR",
        paymentStatus: "paid",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const paymentRef = db.collection("payments").doc(razorpayPaymentId);
      transaction.set(paymentRef, {
        userId,
        amount: totalAmount,
        orderId: orderRef.id,
        razorpayOrderId,
        razorpaySignature,
        razorpayPaymentId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        orderId: orderRef.id,
        paymentId: razorpayPaymentId,
      };
    }
  );

  await sendOrderConfirmation({
    email,
    totalAmount,
    timestamp: new Date().toString(),
    orderId,
    paymentId,
  });
  return { orderId, paymentId };
};

module.exports = { createPaymentOrder, handlePaymentsAndOrder };
