const AppError = require("../errors/AppError");

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    return next(new AppError(`${error.details.map((e) => e.message)}`, 400));
  }

  req.body = value;
  next();
};

module.exports = validate;
