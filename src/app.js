const express = require("express");
const cors = require("cors");
const GlobalErrorHandler = require("./middlewares/errorHandler.middleware");

const AdminRoutes = require("./routes/admin.routes");
const UserRoutes = require("./routes/user.routes");
const PublicRoutes = require("./routes/product.routes");
const app = express();

app.use(cors());
app.use(express.json());

// Public Router
app.use(PublicRoutes);

// User Router
app.use(UserRoutes);

// Admin Router
app.use("/admin", AdminRoutes);

// Health Check
app.use("/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.use(GlobalErrorHandler);

module.exports = app;
