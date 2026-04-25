const AppError = require("../errors/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

/**
 * Validates the request body or params
 *
 * @param {Object} schema - The validation schema
 * @param {string} segment - The segment to validate (body or params)
 * @throws {400, ERROR_CODES.VALIDATION_ERROR} If the validation fails
 */
const validate =
  (schema, segment = "body") =>
  (req, _res, next) => {
    const validateData = req[segment];

    const { error, value } = schema.validate(validateData, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      console.error("[Validation Error]", { segment, errors, data: validateData });

      throw new AppError(
        "Validation failed",
        400,
        ERROR_CODES.VALIDATION_ERROR,
        errors,
      );
    }

    req[segment] = value;
    next();
  };

/**
 * Validates the file upload
 *
 * @throws {400, ERROR_CODES.VALIDATION_ERROR} If the file is not found or not an image
 */
const validateFile = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError("file not uploaded", 400, ERROR_CODES.VALIDATION_ERROR);
  }

  next();
};

module.exports = { validate, validateFile };
