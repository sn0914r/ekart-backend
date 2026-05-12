const cloudinary = require("../clients/cloudinary.js");
const AppError = require("../errors/AppError.js");
const { nanoid } = require("nanoid");
const { logger } = require("../utils/logger.js");
const { ERROR_CODES } = require("../constants/errorCodes.js");

/**
 * Uploads multiple images to Cloudinary
 * 
 * @param {Array} files - Array of multer file objects
 * @returns {Promise<string[]>} Array of public URLs of the uploaded images
 */
const uploadImages = async (files) => {
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

module.exports = { uploadImages };
