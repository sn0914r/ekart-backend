/**
 * @desc Returns the HTML template for the order confirmation email
 *
 * @param {string} email - The email address of the user
 * @param {string} orderId - The ID of the order
 * @param {number} totalAmount - The total amount of the order
 *
 * @returns {string} HTML template
 */
const orderConfirmation = (email, orderId, totalAmount) => {
  const timestamp = new Date().toString();
  return `<div>
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
          <td>Total Payment</td>
          <td>Rs ${totalAmount}</td>
        </tr>
      </table>

      <p style="font-size:smaller">${timestamp}</p>
      <p style="color: gray"> Thanks for shopping with us</p>
    </div>`;
};

module.exports = orderConfirmation;