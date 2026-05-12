const Razorpay = require("razorpay");
const configs = require("../configs/index.js");

const razorpay = new Razorpay({
  key_id: configs.razorpay.keyId,
  key_secret: configs.razorpay.keySecret,
});

module.exports = razorpay;
