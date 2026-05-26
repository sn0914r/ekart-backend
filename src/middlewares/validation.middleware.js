const AppError = require("../errors/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

const validate =
  (schema, segment = "body") =>
  (req, _res, next) => {
    const validateData = req[segment];

    const { error, value } = schema.validate(validateData, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) throw error;

    req[segment] = value;
    next();
  };

const validateFile = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError("file not uploaded", 400, ERROR_CODES.VALIDATION_ERROR);
  }

  next();
};

module.exports = { validate, validateFile };
