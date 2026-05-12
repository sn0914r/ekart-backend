const mongoose = require("mongoose");
const configs = require("../../../configs");
const { ERROR_CODES } = require("../../../constants/errorCodes");
const AppError = require("../../../errors/AppError");
const OrderModel = require("../../../models/Order/Order.model");
const crypto = require("crypto");
const ProductModel = require("../../../models/Product.model");
const { ORDER_STATUS, PAYMENT_STATUS } = require("../../../constants/order");
const { sendMail } = require("../../../providers/nodemailer");
const orderConfirmation = require("../../../templates/orderConfirmation");

/**
 * Verifies payment and confirms order
 *
 * @param {object} paymentData {razorpaySignature, razorpayOrderId, razorpayPaymentId}
 * @returns {object} {orderId: string, razorpayPaymentId: string}
 */

const handlePaymentSuccess = async (paymentData, userId) => {
  const { razorpayOrderId, razorpayPaymentId } = paymentData;

  await idempotencyCheck(razorpayPaymentId);
  validatePaymentSignatures(paymentData);

  const order = await OrderModel.findOne({
    "paymentDetails.razorpayOrderId": razorpayOrderId,
  });

  // INFO: updates Payment status to PAID
  await updatePaymentStatus(order, paymentData);
  await runTransaction(order, userId);

  sendConfirmationMail(order);
  return { orderId: order._id, razorpayPaymentId };
};

module.exports = handlePaymentSuccess;



/* ======================
    Idempotency check
========================*/
const idempotencyCheck = async (razorpayPaymentId) => {
  const order = await OrderModel.findOne({
    "paymentDetails.razorpayPaymentId": razorpayPaymentId,
  })
    .select("_id")
    .lean();

  if (order) {
    throw new AppError(
      `Payment already processed for ${order._id}`,
      409,
      ERROR_CODES.BAD_REQUEST_ERROR,
    );
  }
};

/* ======================
    Signature validation
========================*/
const validatePaymentSignatures = (paymentData) => {
  const generatedSignature = crypto
    .createHmac("sha256", configs.razorpay.keySecret)
    .update(`${paymentData.razorpayOrderId}|${paymentData.razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== paymentData.razorpaySignature) {
    throw new AppError("Invalid Payment", 400, ERROR_CODES.BAD_REQUEST_ERROR);
  }
};

/* ======================
    payment status update
========================*/
const updatePaymentStatus = async (
  order,
  { razorpayPaymentId, razorpaySignature },
) => {
  order.paymentStatus = PAYMENT_STATUS.PAID;
  order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
  order.paymentDetails.razorpaySignature = razorpaySignature;

  await order.save();
};

/* ======================
    Transaction
========================*/
const runTransaction = async (order, userId) => {
  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    for (let item of order.orderSnapshot) {
      const targetProduct = await ProductModel.findById(item.productId);

      // INFO: Edge cases
      if (!targetProduct)
        throw new AppError(
          `Product (${item.name}) not found`,
          404,
          ERROR_CODES.NOT_FOUND_ERROR,
        );

      if (!targetProduct.isActive)
        throw new AppError(
          "Product not available",
          408,
          ERROR_CODES.BAD_REQUEST_ERROR,
        );

      if (targetProduct.stock < item.quantity)
        throw new AppError(
          `Product (${targetProduct.name}) out of stock`,
          409,
          ERROR_CODES.BAD_REQUEST_ERROR,
        );

      // INFO: Reduce stock
      targetProduct.stock -= item.quantity;
      await targetProduct.save({ session });
    }

    // INFO: Save order
    order.orderStatus = ORDER_STATUS.CONFIRMED;
    order.orderStatusHistory.push({
      status: ORDER_STATUS.CONFIRMED,
      at: new Date(),
      by: userId,
    });
    await order.save({ session });
  });

  await session.endSession();
};

/* ======================
    Notifications
========================*/
const sendConfirmationMail = (order) => {
  sendMail({
    to: order.email,
    subject: "Order has been placed successfully",
    template: orderConfirmation(order.email, order._id, order.subTotal),
  });
};
