const transporter = require("../configs/nodemailer.config");

/**
 * @desc Sends an email
 *
 * Side Effects:
 *  - Sends an email
 *
 * @param {string} to - The email address to send the email to
 * @param {string} subject - The subject of the email
 * @param {string} template - The HTML template of the email
 *
 * @returns {void}
 */
const sendMail = ({ to, subject, template }) => {
  transporter.sendMail({
    from: process.env.GMAIL,
    to,
    subject,
    html: template,
  });
};

module.exports = { sendMail };
