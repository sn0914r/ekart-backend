const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";

  const message =
    statusCode === 500 && isProd ? "Something went wrong" : err.message;

  const errorResponse = {
    success: false,
    message,
    errorCode: err.errorCode || "INTERNAL_SERVER_ERROR",
  };

  if (err.errorCode === "VALIDATION_ERROR") {
    errorResponse.errors = err.errors;
  }

  if (!isProd) {
    console.error(err);
  }

  return res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
