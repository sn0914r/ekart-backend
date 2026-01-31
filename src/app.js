const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/orders.router");
const paymentRoutes = require("./routes/payment.routes");
const productRoutes = require("./routes/products.routes");

const app = express();

const errorHandler = require("./middlewares/error.middleware");

app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(helmet());

app.use(authRoutes);
app.use(orderRoutes);
app.use(paymentRoutes);
app.use(productRoutes);

// Health Check
app.use("/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.use(errorHandler);

module.exports = app;
