import redis from "redis";
import { configs } from "../configs/index.js";
import { logger } from "../utils/logger.js";

export const redisClient = redis.createClient({
  url: configs.redisURL,
});

redisClient.on("error", (err) => {
  logger.error("Redis Error", err);
});

export const connectRedis = async () => {
  await redisClient.connect();
  logger.info("Redis connected");
};
