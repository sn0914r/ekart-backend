const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  // console.log(err);
  // console.error(err.message);
  res.status(status).json({
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
