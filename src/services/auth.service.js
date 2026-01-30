const { auth } = require("../configs/firebase.config");
const UserModel = require("../models/User.model");

const createUser = async ({ name, email, password }) => {
  const userRecord = await auth.createUser({
    displayName: name,
    email: email,
    password: password,
  });

  await auth.setCustomUserClaims(userRecord.uid, { role: "user" });

  await UserModel.create({
    uid: userRecord.uid,
    name: userRecord.displayName || name,
    email: userRecord.email,
    role: "user",
  });

  const signInToken = await auth.createCustomToken(userRecord.uid);
  return signInToken;
};

module.exports = { createUser };
