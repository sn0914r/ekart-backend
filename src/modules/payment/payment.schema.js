import joi from "joi";

export const orderIdSchema = joi.object({
  orderId: joi.string().required(),
});

export const paymentVerificationSchema = joi.object({
  razorpayOrderId: joi.string().required(),
  razorpayPaymentId: joi.string().required(),
  razorpaySignature: joi.string().required(),
});
