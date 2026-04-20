const { auth } = require("../../lib/firebase");
const { ROLES } = require("../../constants/roles");
const AppError = require("../../errors/AppError");

const UserModel = require("../../models/User.model");
const { ERROR_CODES } = require("../../constants/errorCodes");

/**
 * Creates a new user at firebase and stores the details in mongoDB
 * 
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @returns {string} - signin token
 */
const createUser = async ({ name, email, password }) => {
  const user = await UserModel.findOne({ email });
  if (user) { 
    throw new AppError("User already exists", 409, ERROR_CODES.BAD_REQUEST_ERROR);
  }

  const userRecord = await auth.createUser({
    displayName: name,
    email: email,
    password: password,
  });

  await auth.setCustomUserClaims(userRecord.uid, { role: ROLES.USER });

  await UserModel.create({
    uid: userRecord.uid,
    name: userRecord.displayName || name,
    email: userRecord.email,
    role: ROLES.USER,
  });

  const signInToken = await auth.createCustomToken(userRecord.uid);
  return signInToken;
};

module.exports = { createUser };
