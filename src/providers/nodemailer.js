const transporter = require("../clients/nodemailer");

const sendMail = ({ to, subject, template }) => {
  transporter.sendMail({
    from: process.env.GMAIL,
    to,
    subject,
    html: template,
  });
};

module.exports = { sendMail };
