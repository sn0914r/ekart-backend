import { cloudinary } from "../clients/cloudinary.js";
import { AppError } from "../errors/AppError.js";
import { nanoid } from "nanoid";
import { logger } from "../utils/logger.js";
import { ERROR_CODES } from "../constants/errorCodes.js";

/**
 * Uploads multiple images to Cloudinary
 *
 * @param {Array} files - Array of multer file objects
 * @returns {Promise<string[]>} Array of public URLs of the uploaded images
 */
export const uploadImages = async (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return [];
  }

  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "eKart", public_id: nanoid() },
        (err, result) => {
          if (err) {
            logger.error(err);
            return reject(
              new AppError(err.message, 400, ERROR_CODES.INTERNAL_SERVER_ERROR),
            );
          }
          resolve(result.secure_url);
        },
      );

      stream.end(file.buffer);
    });
  });

  return Promise.all(uploadPromises);
};
