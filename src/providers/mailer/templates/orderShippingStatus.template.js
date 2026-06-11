/**
 * @param {{
 *   orderId: string,
 *   status: string,
 *   message: string
 * }}
 * @returns {string} HTML email template
 */
export const orderShippingStatusTemplate = ({ orderId, status, message }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2563eb;">Order Status Updated</h2>

      <p>Hello,</p>

      <p>${message}</p>

      <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Current Status:</strong> ${status}</p>
      </div>

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