const admin = require("firebase-admin");
const config = require("../configs/index.js");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: config.firebase.projectId,
    clientEmail: config.firebase.clientEmail,
    privateKey: config.firebase.privateKey,
  }),
});

const auth = admin.auth();

module.exports = { auth, admin };
