const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { logger } = require("./utils/logger");
const errorHandler = require("./middlewares/error.middleware");

const authRoutes = require("./modules/auth/auth.routes");
const orderRoutes = require("./modules/order/order.routes");
const paymentRoutes = require("./modules/payment/payment.routes");
const productRoutes = require("./modules/product/product.routes");
const cartRoutes = require("./modules/cart/cart.routes");

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use((req, res, next) => {
  logger.info(`New Request: ${req.method}/ ${req.url}`);
  next();
});


app.use(authRoutes);
app.use(orderRoutes);
app.use(paymentRoutes);
app.use(productRoutes);
app.use(cartRoutes);

app.use("/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.use(errorHandler);

module.exports = app;
