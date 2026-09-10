import { redisClient } from "#clients/redis.js";
import { configs } from "#configs/index.js";
import { emailQueue } from "#queues/email.queue.js";
import UserModel from "../models/user.model.js";
import crypto from "node:crypto";

/**
 * @param {string} email
 * @returns {Promise<void>}
 */
export const forgotPassword = async (email) => {
  const existingUser = await UserModel.findOne({ email });
  if (!existingUser) return;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const key = `password-reset-user:${tokenHash}`
  await redisClient.setex(key, 900, existingUser.id )

  await emailQueue.add("password-reset-mail", {
    template: "password-reset",
    to: email,
    subject: "Reset your password",
    payload: {
        resetLink: `${configs.frontendOrigin}/reset-password?token=${rawToken}`,
        name: existingUser.name,
        expiresIn: "15 minutes"
    }
  })

  return
};
