import { v2 as cloudinary } from "cloudinary";
import { configs } from "../configs/index.js";

cloudinary.config({
  cloud_name: configs.cloudinary.cloud_name,
  api_key: configs.cloudinary.api_key,
  api_secret: configs.cloudinary.api_secret,
});

export { cloudinary };
