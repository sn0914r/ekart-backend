require("dotenv").config();
const app = require("./app");
const configs = require("./configs/index");
const connectDB = require("./lib/db");
const { logger } = require("./utils/logger");

const PORT = configs.port;

connectDB();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
