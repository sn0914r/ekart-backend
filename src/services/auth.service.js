const { auth, admin } = require("../configs/firebase.config");
const { createDoc } = require("../db/db.helpers");

const createUser = async ({ name, email, password }) => {
  const userRecord = await auth.createUser({
    displayName: name,
    email: email,
    password: password,
  });

  await auth.setCustomUserClaims(userRecord.uid, { role: "user" });
  await createDoc("users", {
    uid: userRecord.uid,
    name: userRecord.displayName || name,
    email: userRecord.email,
    role: "user",
    authProvider: "password",

    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const signInToken = await auth.createCustomToken(userRecord.uid);
  return signInToken;
};

module.exports = { createUser };
