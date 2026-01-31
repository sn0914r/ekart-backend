const cloudinary = require("../configs/cloudinary.config");
const AppError = require("../errors/AppError");
const generateRandomString = require("../utils/randomStringGenerator");

/**
 * @desc Uploads an image to Cloudinary
 * 
 * Side Effects:
 *  - Uploads the image to Cloudinary
 * 
 * @param {Buffer} buffer - The image buffer
 * @returns {<Promise<string>} The public URL of the uploaded image
 */
const uploadImage = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "eKart", public_id: generateRandomString() },
      (err, result) => {
        if (err) {
          return reject(new AppError(err.message, 400));
        }
        resolve(result.secure_url);
      },
    );

    stream.end(buffer);
  });

module.exports = { uploadImage };
