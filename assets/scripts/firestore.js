// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBsUa6wHxcaTD88zGMYsMzGaFGEZhBf6-w",
    authDomain: "arbtrack-database.firebaseapp.com",
    databaseURL: "https://arbtrack-database-default-rtdb.firebaseio.com",
    projectId: "arbtrack-database",
    storageBucket: "arbtrack-database.appspot.com",
    messagingSenderId: "396149381897",
    appId: "1:396149381897:web:8eb6db05d3c5faaa0651d8",
    measurementId: "G-P3J670QLKC"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();