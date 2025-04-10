// Vérifie si l'utilisateur est authentifié et ajoute des fonctionnalités spécifiques
async function checkAuthentication(isAdminPage = false) {
    const token = localStorage.getItem('token'); // Récupère le token depuis localStorage

    if (!token) {
        redirectToLogin();
        return;
    }

    try {
        const response = await fetch('http://172.22.231.241:3000/user-info', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            redirectToLogin();
            return;
        }

        const user = await response.json();

        // Si la page nécessite un rôle admin, vérifier le rôle
        if (isAdminPage && user.role !== 'admin') {
            alert('Accès refusé. Cette page est réservée aux administrateurs.');
            redirectToHome();
            return;
        }

        // Ajouter le bouton "Administration" si l'utilisateur est admin
        if (user.role === 'admin') {
            addAdminButton();
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du token :', error);
        redirectToLogin();
    }
}

// Redirige vers la page de connexion
function redirectToLogin() {
    alert('Accès non autorisé. Veuillez vous connecter.');
    window.location.href = '/login.html';
}

// Redirige vers la page d'accueil
function redirectToHome() {
    window.location.href = '/index.html';
}

// Fonction de déconnexion
function logout() {
    localStorage.removeItem('token'); // Supprime le token
    alert('Déconnexion réussie');
    redirectToLogin(); // Redirige vers la page de connexion
}

// Ajoute dynamiquement un bouton "Déconnexion" à toutes les pages
function addLogoutButton() {
    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Déconnexion';
    logoutButton.style.position = 'fixed';
    logoutButton.style.top = '10px';
    logoutButton.style.right = '10px';
    logoutButton.style.backgroundColor = '#ff4d4d';
    logoutButton.style.color = 'white';
    logoutButton.style.border = 'none';
    logoutButton.style.padding = '10px 15px';
    logoutButton.style.cursor = 'pointer';
    logoutButton.style.borderRadius = '5px';
    logoutButton.style.zIndex = '1000'; // S'assurer qu'il reste au-dessus

    logoutButton.addEventListener('click', logout);
    document.body.appendChild(logoutButton);
}

// Ajoute dynamiquement un bouton "Administration" à toutes les pages pour les admins
function addAdminButton() {
    const adminButton = document.createElement('button');
    adminButton.textContent = 'Administration';
    adminButton.style.position = 'fixed';
    adminButton.style.top = '10px';
    adminButton.style.left = '10px';
    adminButton.style.backgroundColor = '#4CAF50';
    adminButton.style.color = 'white';
    adminButton.style.border = 'none';
    adminButton.style.padding = '10px 15px';
    adminButton.style.cursor = 'pointer';
    adminButton.style.borderRadius = '5px';
    adminButton.style.zIndex = '1000'; // S'assurer qu'il reste au-dessus

    adminButton.addEventListener('click', () => {
        window.location.href = '/admin.html'; // Redirige vers la page admin
    });

    document.body.appendChild(adminButton);
}

// Exécute les vérifications et ajoute les boutons nécessaires
document.addEventListener('DOMContentLoaded', () => {
    const isAdminPage = document.body.classList.contains('admin-page'); // Classe pour indiquer une page admin
    checkAuthentication(isAdminPage);
    addLogoutButton();
});
