import { transporter } from "../clients/nodemailer.js";

export const sendMail = ({ to, subject, template }) => {
  transporter.sendMail({
    from: process.env.GMAIL,
    to,
    subject,
    html: template,
  });
};
