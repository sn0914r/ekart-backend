import crypto from "crypto";
import { configs } from "#configs/index.js";
import { logger } from "#utils/logger.js";

export const verifyPOESignature = (req, res, next) => {
  logger.info("INCOMING POE WEBHOOK REQUEST");
  const signature = req.header("x-poe-webhook-signature");

  if (!signature) {
    logger.warn("WEBHOOK REJECTED: Missing x-poe-webhook-signature header");
    return res
      .status(401)
      .json({ success: false, message: "Missing signature" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", configs.paymentService.Secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== expectedSignature) {
    logger.warn("WEBHOOK REJECTED: Invalid signature");
    return res.status(401).json({
      success: false,
      message: "Invalid signature",
    });
  }

  next();
};
