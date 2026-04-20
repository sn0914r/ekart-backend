const AppError = require("../errors/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

/**
 * Parses the JSON fields in the request body and attaches it to the req.body
 * 
 * @param {string} field - The field to parse
 * @throws {400, ERROR_CODES.VALIDATION_ERROR} If the field is not found or not a JSON object
 * @throws {400, ERROR_CODES.VALIDATION_ERROR} If the field is not a JSON object
 */
const parseJsonFields = (field) => (req, res, next) => {
  let data = req.body[field];

  if (!data)
    throw new AppError(`${field} field not found`, 400, ERROR_CODES.VALIDATION_ERROR);
  if (typeof data === "string") data = JSON.parse(data);

  if (typeof data !== "object")
    throw new AppError(`${field} must be JSON object`, 400, ERROR_CODES.VALIDATION_ERROR);

  req.body = data;
  next();
};

module.exports = parseJsonFields;
