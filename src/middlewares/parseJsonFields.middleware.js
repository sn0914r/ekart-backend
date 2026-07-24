import { AppError } from "#errors/AppError.js";
import { ERROR_CODES } from "#constants/errorCodes.js";

export const parseJsonFields = (field) => (req, _res, next) => {
  let data = req.body[field];

  if (!data)
    throw new AppError(
      `${field} field not found`,
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  if (typeof data === "string") data = JSON.parse(data);

  if (typeof data !== "object")
    throw new AppError(
      `${field} must be JSON object`,
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );

  req.body = data;
  next();
};
