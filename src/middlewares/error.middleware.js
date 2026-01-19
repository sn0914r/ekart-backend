const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;

  const message = status === 500 ? "Something went wrong" : err.message;

  res.status(status).json({ message });
};

module.exports = errorHandler;
