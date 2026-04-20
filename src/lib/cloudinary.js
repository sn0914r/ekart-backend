const cloudinary = require("cloudinary").v2;
const configs = require("../configs/index.js");

cloudinary.config({
  cloud_name: configs.cloudinary.cloud_name,
  api_key: configs.cloudinary.api_key,
  api_secret: configs.cloudinary.api_secret,
});

module.exports = cloudinary;