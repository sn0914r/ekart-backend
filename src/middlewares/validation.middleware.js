const AppError = require("../errors/AppError");

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    const errors = error.details.map((e) => e.message).toString();
    throw new AppError(errors, 400);
  }

  req.body = value;
  next();
};

const validateFile = (req, res, next) => {
  if (!req.file) {
    throw new AppError("file not uploaded", 400);
  }
  next();
};

module.exports = { validateBody, validateFile };
