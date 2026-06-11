export const configs = {
  port: process.env.PORT || 3000,
  node_env: process.env.NODE_ENV || "development",
  clientOrigins: process.env.CLIENT_ORIGINS
    ? process.env.CLIENT_ORIGINS.split(",")
    : ["http://localhost:3000"],

  mongoURI: process.env.MONGO_URI,

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },

  razorpay: {
    keyId: process.env.RAZORPAY_TEST_API_KEY,
    keySecret: process.env.RAZORPAY_TEST_KEY_SECRET,
  },

  nodemailer: {
    gmail: process.env.GMAIL,
    gmailPasswordKey: process.env.GMAIL_PASSWORD_KEY,
  },

  auth_jwt: {
    accessSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
    refreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
    accessTokenExpireTime: process.env.JWT_ACCESS_TOKEN_EXPIRES,
    refreshTokenExpireTime: process.env.JWT_REFRESH_TOKEN_EXPIRES,
  },

  redisURL: process.env.REDIS_URL,
};
