function loginWithEmail() {
    var email = document.getElementById("login-email").value;
    var password = document.getElementById("login-password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("Logado com sucesso!");
            window.location.href = 'index.html'; // Redirecione após o login bem-sucedido
        })
        .catch((error) => {
            alert("Erro ao tentar o login. Verifique os dados inseridos!");
        });
}

function loginWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            alert("Logado com sucesso com sua conta Google");
            window.location.href = 'index.html'; // Redirecione após o login bem-sucedido
        })
        .catch((error) => {
            alert("Erro ao tentar o login. Verifique os dados inseridos!");
        });
}

function registerWithEmail() {
    var email = document.getElementById("register-email").value;
    var password = document.getElementById("register-password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("Registro concluido com sucesso!");
            showLogin(); // Mostrar a tela de login após o registro
        })
        .catch((error) => {
            alert("Erro");
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
    firebase.auth().onAuthStateChanged(function (user) {
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
        alert("Desconectado com sucesso!");
        setTimeout(function() {
            window.location.href = 'login.html'; // Redireciona para a página de login após o logout
        }, 1000); // Atraso de 1 segundo (1000 milissegundos)
    }).catch((error) => {
        alert("Error: " + error.message);
    });
}


function resetPassword() {
    var email = document.getElementById("login-email").value;

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            alert("Um email de recuperação de senha foi enviado para o seu endereço de email.");
        })
        .catch((error) => {
            alert("Erro ao enviar email de recuperação de senha: " + error.message);
        });
}