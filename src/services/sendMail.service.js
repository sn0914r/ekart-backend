const transporter = require("../configs/nodemailer.config");

const sendMail = async (targetMail, subject, msgHTML) => {
  const mailOptions = {
    from: process.env.GMAIL,
    to: targetMail,
    subject,
    html: msgHTML,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
