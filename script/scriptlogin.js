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

function loginWithEmail() {
    var email = document.getElementById("login-email").value;
    var password = document.getElementById("login-password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("Login successful!");
            window.location.href = 'index.html'; // Redirecione após o login bem-sucedido
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
}

function loginWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            alert("Login with Google successful!");
            window.location.href = 'index.html'; // Redirecione após o login bem-sucedido
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
}

function registerWithEmail() {
    var email = document.getElementById("register-email").value;
    var password = document.getElementById("register-password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("Registration successful!");
            showLogin(); // Mostrar a tela de login após o registro
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
}

function showLogin() {
    document.getElementById("login-container").style.display = "flex";
    document.getElementById("register-container").style.display = "none";
}

function showRegister() {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("register-container").style.display = "flex";
}

// Função para verificar se o usuário está autenticado
function checkAuth() {
    firebase.auth().onAuthStateChanged(function(user) {
        const currentPage = window.location.pathname;
        
        if (!user && currentPage !== '/login.html') {
            // Redireciona para a página de login se não estiver autenticado e não estiver na página de login
            window.location.href = 'login.html';
        } else if (user && currentPage === '/login.html') {
            // Se o usuário já estiver autenticado, redireciona para o dashboard
            window.location.href = 'index.html';
        }
    });
}

// Função de logout
function logout() {
    firebase.auth().signOut().then(() => {
        alert("Logout successful!");
        window.location.href = 'login.html'; // Redireciona para a página de login após o logout
    }).catch((error) => {
        alert("Error: " + error.message);
    });
}