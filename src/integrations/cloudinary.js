const cloudinary = require("../lib/cloudinary.js");
const AppError = require("../errors/AppError.js");
const { nanoid } = require("nanoid");
const { logger } = require("../utils/logger.js");
const { ERROR_CODES } = require("../constants/errorCodes.js");

/**
 * @desc Uploads an image to Cloudinary
 *
 * Side Effects:
 *  - Uploads the image to Cloudinary
 *
 * @param {Buffer} buffer - The image buffer
 * @returns {Promise<string>} The public URL of the uploaded image
 */
const uploadImage = (buffer) => {
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

    stream.end(buffer);
  });
};

module.exports = { uploadImage };
