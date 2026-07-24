import nodemailer from "nodemailer";
import { configs } from "#configs/index.js";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: configs.nodemailer.gmail,
    pass: configs.nodemailer.gmailPasswordKey,
  },
});
