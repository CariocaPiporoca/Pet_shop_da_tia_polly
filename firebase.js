const admin = require("firebase-admin");
const chaveFirebase = require("./firebase-key.json");
admin.initializeApp({
    credential: admin.credential.cert(chaveFirebase)
});

//conexão com firestore
const banco = admin.firestore();

//conexão com firebase autentication
const autenticacao = admin.auth();

module.exports = {
    admin,
    banco,
    autenticacao
};