
// Conectar-se com o Firebase
const { initializeApp, cert } = require('firebase-admin/app');


const { getFirestore } = require('firebase-admin/firestore');


const serviceAccount = require('./firebase-service-account.json');



// Iniciar o Firebase

initializeApp({

    

    credential: cert(serviceAccount)

});

// Conectar com o Firestore

const db = getFirestore();


// Testar Conexão

console.log('Firebase conectado com sucesso!');


// Exportar o Banco

module.exports = db;