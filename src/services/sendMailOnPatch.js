const sendMail = require("./sendMail.service");

const sendMailOnPatch = (updates) => {
  const { orderStatus, shippingStatus, trackingId, updatedAt, userMail } =
    updates;

  // 1. Subject Logic (Based on Schema)
  let subject = "Update regarding your Order";

  if (shippingStatus === "delivered") {
    subject = "Your Order has been Delivered! 🎉";
  } else if (shippingStatus === "shipped") {
    subject = "Your Order is on the way! 🚚";
  } else if (orderStatus === "confirmed") {
    subject = "Your Order is Confirmed! ✅";
  } else if (orderStatus === "cancelled" || shippingStatus === "cancelled") {
    subject = "Important: Order Cancelled";
  } else if (trackingId) {
    subject = "Tracking Information Updated";
  } else if (orderStatus === "created") {
    subject = "Order Successfully Placed";
  }

  // 2. Inline Styles
  const styles = {
    container:
      "font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;",
    header:
      "color: #333; font-size: 24px; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px;",
    row: "background: #f9f9f9; padding: 15px; margin-bottom: 10px; border-radius: 5px;",
    label:
      "font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; display: block;",
    val: "color: #000; font-size: 16px; display: block; margin-top: 5px;",
  };

  // 3. Build Body
  let msgContent = "";
  if (orderStatus) {
    msgContent += `<div style="${styles.row}"><span style="${styles.label}">Order Status</span><span style="${styles.val}">${orderStatus}</span></div>`;
  }
  if (shippingStatus) {
    msgContent += `<div style="${styles.row}"><span style="${styles.label}">Shipping Status</span><span style="${styles.val}">${shippingStatus}</span></div>`;
  }
  if (trackingId) {
    msgContent += `<div style="${styles.row}"><span style="${styles.label}">Tracking Details</span><span style="${styles.val}">ID: ${trackingId}</span></div>`;
  }

  const dateStr = new Date(
    updatedAt._seconds * 1000 + updatedAt._nanoseconds / 1e6
  );

  const fullHtml = `
    <div style="${styles.container}">
      <div style="${styles.header}">Order Update</div>
      ${msgContent}
      <div style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">Updated: ${dateStr}</div>
    </div>
  `;

  if (orderStatus || shippingStatus || trackingId) {
    sendMail(userMail, subject, fullHtml);
  }
};

module.exports = sendMailOnPatch;
