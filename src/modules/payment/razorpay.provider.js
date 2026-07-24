import { razorpay } from "#clients/razorpay.js";
/**
 * @param {number} totalAmount - amount in paise
 * @param {string} userId
 * @returns {Promise<string>} Razorpay order id
 */
export const createRazorpayOrder = async (totalAmount, userId) => {
  const razorpayOptions = {
    amount: totalAmount * 100,
    currency: "INR",
    // INFO: the razorpay receipt must be lessthan 40 chars
    receipt: `receipt_${userId.slice(0, 4)}_${Date.now()}`,
  };

  const order = await razorpay.orders.create(razorpayOptions);
  return order.id;
};
