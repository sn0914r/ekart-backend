import multer from "multer";
import { AppError } from "../errors/AppError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(
        new AppError(
          "Invalid file format: Only images are allowed",
          400,
          ERROR_CODES.VALIDATION_ERROR,
        ),
        false,
      );
    }

    cb(null, true);
  },
}).array("files", 10);
