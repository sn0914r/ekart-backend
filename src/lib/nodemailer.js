const nodemailer = require("nodemailer");
const config = require("../configs/index.js");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.nodemailer.gmail,
    pass: config.nodemailer.gmailPasswordKey,
  },
});

module.exports = transporter;
