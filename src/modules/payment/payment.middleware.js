import crypto from "crypto";
import { configs } from "#configs/index.js";

export const verifyPOESignature = (req, res, next) => {
  const signature = req.header("x-poe-webhook-signature");

  if (!signature) {
    return res
      .status(401)
      .json({ success: false, message: "Missing signature" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", configs.paymentService.Secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(401).json({
      success: false,
      message: "Invalid signature",
    });
  }

  next();
};
