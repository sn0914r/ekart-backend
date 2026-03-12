const AppError = require("../errors/AppError");

const validate =
  (schema, segment = "body") =>
  (req, _res, next) => {
    const dataToValiate = req[segment];

    const { error, value } = schema.validate(dataToValiate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);

      throw new AppError("Validation failed", 400, "VALIDATION_ERROR", errors);
    }

    req[segment] = value;
    next();
  };

const validateFile = (req, res, next) => {
  if (!req.file) {
    throw new AppError("file not uploaded", 400);
  }
  next();
};

module.exports = { validate, validateFile };
