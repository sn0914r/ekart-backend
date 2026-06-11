/**
 * @param {{
 *   orderId: string, 
 *   totalAmount: number
 * }}
 * @returns {string} HTML email template
 */
export const orderConfirmationTemplate = ({ orderId, totalAmount }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #16a34a;">Order Confirmed </h2>

      <p>Hello,</p>

      <p>
        Thank you for your purchase! Your order has been successfully placed and confirmed.
      </p>

      <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
        <p><strong>Status:</strong> Confirmed</p>
      </div>

      <p>
        We're preparing your order for shipment. You'll receive another email once your order has been shipped.
      </p>

      <p>
        Thank you for shopping with us.
      </p>

      <p>
        Best regards,<br />
        <strong>eKart Team</strong>
      </p>
    </div>
  `;
};