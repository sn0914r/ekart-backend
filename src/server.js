import "dotenv/config";
import { app } from "./app.js";
import { configs } from "./configs/index.js";
import { connectMongoDB } from "./clients/mongodb.js";
import { logger } from "./utils/logger.js";

const PORT = configs.port;

const startServer = () => {
  connectMongoDB();

  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};

startServer();
