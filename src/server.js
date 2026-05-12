require("dotenv").config();
const app = require("./app");
const configs = require("./configs/index");
const connectMongoDB = require("./clients/mongodb");
const { logger } = require("./utils/logger");

const PORT = configs.port;

connectMongoDB();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
