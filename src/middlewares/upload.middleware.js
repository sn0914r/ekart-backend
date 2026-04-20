const multer = require("multer");
const AppError = require("../errors/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

/**
 * Uploads a single image file
 * 
 * @throws {400, ERROR_CODES.VALIDATION_ERROR} If the field is not found or not an image
 * @throws {400, ERROR_CODES.VALIDATION_ERROR} If the file size exceeds 5MB
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(
        new AppError("Invalid file format: Only images are allowed", 400, ERROR_CODES.VALIDATION_ERROR),
        false,
      );
    }

    cb(null, true);
  },
}).single("file");

module.exports = upload;
