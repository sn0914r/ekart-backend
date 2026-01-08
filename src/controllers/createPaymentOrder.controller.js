const razorpay = require("../configs/razorpay.config");
const AppError = require("../errors/AppError");
const getTotalPrice = require("../services/getTotalPrice.service");
const asyncErrorHandler = require("../utils/asyncErrorHandler");

const createPaymentOrder = asyncErrorHandler(async (req, res, next) => {
  try {
    const { items } = req.body;

    const totalAmount = await getTotalPrice(items);

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

module.exports = createPaymentOrder;
