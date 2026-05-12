const razorpay = require("../clients/razorpay");

const createRazorpayOrder = async (subTotal, userId) => {
  const razorpayOptions = {
    amount: subTotal * 100,
    currency: "INR",
    // NOTE: the razorpay receipt must be lessthan 40 chars
    receipt: `receipt_${userId.slice(0, 4)}_${Date.now()}`,
  };

  const order = await razorpay.orders.create(razorpayOptions);
  return order.id;
};

module.exports = { createRazorpayOrder };
