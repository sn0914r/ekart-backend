const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./modules/auth/auth.routes");
const orderRoutes = require("./modules/order/order.routes");
const paymentRoutes = require("./modules/payment/payment.routes");
const productRoutes = require("./modules/product/product.routes");
const cartRoutes = require("./modules/cart/cart.routes");

const app = express();

const errorHandler = require("./middlewares/error.middleware");

app.use(cors());
app.use(express.json());
app.use(helmet());

app.use(authRoutes);
app.use(orderRoutes);
app.use(paymentRoutes);
app.use(productRoutes);
app.use(cartRoutes);

// Health Check
app.use("/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.use(errorHandler);

module.exports = app;
