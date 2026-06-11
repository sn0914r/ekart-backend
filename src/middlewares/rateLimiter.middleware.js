import { redisClient } from "../clients/redis.js";
import { ERROR_CODES } from "../constants/errorCodes.js";
import { AppError } from "../errors/AppError.js";

export const rateLimiter = (maxAttempts, route, timeInSeconds = 300) => {
  return async (req, _res, next) => {
    const key = `ratelimit:${route}:${req.ip}`;
    console.log("Request from " + key);

    const count = await redisClient.incr(key);

    if (count === 1) {
      await redisClient.expire(key, timeInSeconds);
    }

    const ttl = await redisClient.ttl(key);

    const minutes = Math.ceil(ttl / 60);
    const time = ttl >= 60 ? `${minutes} minute(s)` : `${ttl} second(s)`;

    if (count > maxAttempts) {
      throw new AppError(
        `Too many requests, try again after ${time}`,
        429,
        ERROR_CODES.RATE_LIMIT_ERROR,
      );
    }

    next();
  };
};
