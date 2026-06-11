import { transporter } from "../../clients/nodemailer.js";
import { configs } from "../../configs/index.js";
import { logger } from "../../utils/logger.js";

/**
 *
 * @param {string} to
 * @param {string} subject
 * @param {string} template
 */
export const sendEmail = async (to, subject, template) => {
  try {
    const info = await transporter.sendMail({
      from: configs.nodemailer.gmail,
      to,
      subject,
      html: template,
    });
    logger.info(
      `[Email Service] Successfully sent email to ${to}. Message ID: ${info.messageId}`,
    );
  } catch (error) {
    logger.error(
      `[Email Service] Failed to send email to ${to} via Gmail. Error:`,
      error,
    );
  }
};
