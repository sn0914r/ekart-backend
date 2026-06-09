import { AppError } from "../errors/AppError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";

export const validate =
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

export const validateFile = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError("file not uploaded", 400, ERROR_CODES.VALIDATION_ERROR);
  }

  next();
};
