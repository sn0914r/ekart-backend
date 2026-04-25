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
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:5173", "https://ekart-admin-dashboard.pages.dev", "https://ekart-frontend.pages.dev"],
    credentials: true,
  }),
);
app.use(helmet());

app.use((req, res, next) => {
  logger.info(`New Request: ${req.method} ${req.url}`);
  // logger.info("Request Body: " + JSON.stringify(req.body));
  // logger.info("Request Params: " + JSON.stringify(req.params));
  // logger.info("Request Query: " + JSON.stringify(req.query));
  // logger.info("Request Cookies: " + JSON.stringify(req.cookies));
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
