const { bucket } = require("../configs/firebase.config");
const AppError = require("../errors/AppError");
const randomStringGenerator = require("../utils/randomStringGenerator");

const uploadImage = async (file) => {
  try {
    const fileName = randomStringGenerator();
    const fileUpload = bucket.file(fileName);
    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    await fileUpload.makePublic();

    const publicuUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    return publicuUrl;
  } catch (error) {
    throw new AppError(error.message, 500);
  }
};

module.exports = uploadImage;
