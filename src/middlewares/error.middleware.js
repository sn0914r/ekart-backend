const errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500;
  
  const message = status === 500 ? "Something went wrong" : err.message;
console.log(err)
  res.status(status).json({ message });
};

module.exports = errorHandler;
