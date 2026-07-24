import { Queue } from "bullmq";
import Redis from "ioredis";

const redisConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const emailQueue = new Queue("email", {
  connection: redisConnection,
});
