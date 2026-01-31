const AppError = require("../errors/AppError");

const errorHandler = (err, _req, res, _next) => {
  const isProduction = process.env.NODE_ENV === "production";
  const status = err.status || 500;

  if (!isProduction) {
    return res.status(status).json({
      message: err.message,
      stack: err.stack,
    });
  }

  if (err instanceof AppError) {
    return res.status(status).json({ message: err.message, stack: err.stack });
  }

  return res.status(500).json({ message: "Internal server error" });
};

module.exports = errorHandler;
