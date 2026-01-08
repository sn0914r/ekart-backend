const AppError = require("../errors/AppError");
const createRecord = require("../services/createRecord.service");
const getTotalPrice = require("../services/getTotalPrice.service");
const sendMail = require("../services/sendMail.service");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const isPaymentValid = require("../utils/isPaymentValid");

const verifyPaymentOrder = asyncErrorHandler(async (req, res, next) => {
  const { uid: userId, email: userMail } = req["user"];

  const {
    items,
    paymentDetails: { razorpayPaymentId, razorpaySignature, razorpayOrderId },
  } = req.body;

  const isValidPayment = isPaymentValid(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  const createdAt = new Date();
  const updatedAt = new Date();

  try {
    if (!isValidPayment) {
      return next(new AppError("Payment is not valid", 400));
    }

    const totalAmount = await getTotalPrice(items);

    const orderRecord = {
      userId,
      userMail,
      items,
      totalAmount,
      currency: "INR",
      paymentStatus: isValidPayment ? "paid" : "failed",
      paymentDetails: {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      },
      orderStatus: "created",
      shippingStatus: "pending",
      trackingId: null,
      createdAt,
      updatedAt,
    };

    const orderId = await createRecord(orderRecord, "orders");

    const mailSubject = "Order has been placed successfully";
    const msgHTML = `<div style="font-family: Arial, Helvetica, sans-serif; background-color:#f4f6f8; padding:20px;">
        <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:6px; padding:20px; box-shadow:0 2px 6px rgba(0,0,0,0.08);">
          <h2 style="color:#2c3e50; margin-bottom:10px;">Order Confirmation</h2>

          <p style="color:#555; font-size:14px; line-height:1.6;">
            Hello <strong>${userMail}</strong>,
          </p>

          <p style="color:#555; font-size:14px; line-height:1.6;">
            Your order has been placed successfully. Below are the order
            details:
          </p>

          <table style="width:100%; border-collapse:collapse; margin-top:15px;">
            <tr>
              <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">
                Order ID
              </td>
              <td style="padding:8px; border:1px solid #ddd;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">
                Total Payment
              </td>
              <td style="padding:8px; border:1px solid #ddd;">
                ₹ ${totalAmount}
              </td>
            </tr>
            <tr>
              <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">
                Order Created At
              </td>
              <td style="padding:8px; border:1px solid #ddd;">${createdAt}</td>
            </tr>
          </table>

          <p style="color:#555; font-size:14px; line-height:1.6; margin-top:20px;">
            Thank you for shopping with us!
          </p>
        </div>
      </div>`;
    sendMail(userMail, mailSubject, msgHTML);
    res.status(200).json({ success: true, orderId });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError(error.message, 500));
  }
});

module.exports = verifyPaymentOrder;
