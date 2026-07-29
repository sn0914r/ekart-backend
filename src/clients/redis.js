import Redis from "ioredis";
import { configs } from "#configs/index.js";
import { logger } from "#utils/logger.js";

export const redisClient = new Redis(configs.redisURL);

redisClient.on("error", (err) => {
  logger.error("Redis Error", err);
});

export const connectRedis = async () => {
  await redisClient.ping();
  logger.info("Redis connected");
};
