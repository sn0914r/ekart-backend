const multer = require("multer");
const AppError = require("../errors/AppError");

/**
 * @desc Uploads a single file
 *
 * Preconditions:
 *  - Request is multipart/form-data
 *
 * Blocks when:
 *  - No file is provided
 *  - File is not an image
 *  - File size exceeds 5MB
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
        new AppError("Invalid file format: Only images are allowed", 400),
        false,
      );
    }

    cb(null, true);
  },
}).single("file");

module.exports = upload;
