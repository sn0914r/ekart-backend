const RazoryPay = require("razorpay");

const razorpay = new RazoryPay({
  key_id: process.env.RAZORPAY_TEST_API_KEY,
  key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
});

module.exports = razorpay;
