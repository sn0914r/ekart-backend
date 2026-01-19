const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const AdminRoutes = require("./routes/admin.routes");
const UserRoutes = require("./routes/user.routes");
const PublicRoutes = require("./routes/public.routes");
const PaymentRoutes = require("./routes/payment.routes");

const app = express();

const errorHandler = require("./middlewares/error.middleware");

app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(helmet());

// Public Router
app.use(PublicRoutes);

// User Router
app.use(UserRoutes);

// Admin Router
app.use("/admin", AdminRoutes);

// Payment routes
app.use("/payments", PaymentRoutes);

// Health Check
app.use("/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.use(errorHandler);

module.exports = app;
