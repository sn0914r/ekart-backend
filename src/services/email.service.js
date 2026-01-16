const transporter = require("../configs/nodemailer.config");

const sendOrderConfirmation = async ({
  email,
  orderId,
  totalAmount,
  timestamp,
  payementId,
}) => {
  const subject = "Order has been placed successfully";
  const msg = `<div>
      <h3>
        Hello <strong>${email}</strong>
      </h3>
      <p>
        Your order has been placed successfully. Below are the order details:
      </p>
      <table>
        <tr>
          <td>Order ID</td>
          <td>${orderId}</td>
        </tr>
                <tr>
          <td>Payment ID</td>
          <td>${payementId}</td>
        </tr>
        <tr>
          <td>Total Payment</td>
          <td>${totalAmount}</td>
        </tr>
      </table>

      <p style="font-size:smaller">${timestamp}</p>
      <p style="color: gray"> Thanks for shopping with us</p>
    </div>`;

  await transporter.sendMail({
    from: process.env.GMAIL,
    to: email,
    subject,
    html: msg,
  });
};

module.exports = { sendOrderConfirmation };
