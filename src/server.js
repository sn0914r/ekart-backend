import "dotenv/config";
import { configs } from "#configs/index.js";
import { connectMongoDB } from "#clients/mongodb.js";
import { connectRedis } from "#clients/redis.js";
import { logger } from "#utils/logger.js";
import { app } from "./app.js";

const PORT = configs.port;

const startServer = async () => {
  await connectMongoDB();
  await connectRedis();

  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};

startServer();
