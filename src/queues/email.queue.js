import { Queue } from "bullmq";
import Redis from "ioredis";
import { configs } from "#configs/index.js";

const redisConnection = new Redis(configs.redisURL, {
  maxRetriesPerRequest: null,
});

export const emailQueue = new Queue("email", {
  connection: redisConnection,
});
