const configs = {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  razorpay: {
    keyId: process.env.RAZORPAY_TEST_API_KEY,
    keySecret: process.env.RAZORPAY_TEST_KEY_SECRET,
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  },
  nodemailer: {
    gmail: process.env.GMAIL,
    gmailPasswordKey: process.env.GMAIL_PASSWORD_KEY,
  },
  node_env: process.env.NODE_ENV || "development",
  jwtSecret: {
    access: process.env.JWT_ACCESS_TOKEN_SECRET,
    refresh: process.env.JWT_REFRESH_TOKEN_SECRET,
    accessTokenExpireTime: process.env.JWT_ACCESS_TOKEN_EXPIRES,
    refreshTokenExpireTime: process.env.JWT_REFRESH_TOKEN_EXPIRES,
  },
};

module.exports = configs;
