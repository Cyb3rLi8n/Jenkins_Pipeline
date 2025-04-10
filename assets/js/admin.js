// Vérification du rôle admin
async function checkAdminRole() {
    const token = localStorage.getItem('token');
    if (!token) {
        redirectToHome();
        return;
    }

    try {
        const response = await fetch('http://172.22.231.241:3000/user-info', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            if (user.role !== 'admin') {
                alert('Accès refusé : Vous devez être administrateur pour accéder à cette page.');
                redirectToHome();
            }
        } else {
            redirectToHome();
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du rôle admin :', error);
        redirectToHome();
    }
}

// Redirection vers la page d'accueil
function redirectToHome() {
    window.location.href = '/index.html';
}

// Charger les utilisateurs lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication(true); // Vérifie si l'utilisateur est admin
    loadUsers(); // Charge la liste des utilisateurs
    setupAddUserForm(); // Configure le formulaire pour ajouter des utilisateurs
});

// Configuration du formulaire pour ajouter un utilisateur
function setupAddUserForm() {
    const addUserForm = document.getElementById('addUserForm');

    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        try {
            const response = await fetch('http://172.22.231.241:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ username, password, role })
            });

            if (response.ok) {
                const data = await response.json();
                alert('Utilisateur ajouté avec succès');
                loadUsers(); // Recharge la liste des utilisateurs
            } else {
                const errorData = await response.json();
                alert(`Erreur : ${errorData.error}`);
            }
        } catch (error) {
            console.error('Erreur :', error);
            alert('Une erreur est survenue');
        }
    });
}

// Charger les utilisateurs et afficher le tableau
async function loadUsers() {
    try {
        const response = await fetch('http://172.22.231.241:3000/admin/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const users = await response.json();
            const userTableBody = document.getElementById('userTable').querySelector('tbody');
            userTableBody.innerHTML = ''; // Réinitialise le tableau

            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.role}</td>
                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                    <td><button class="delete-button" data-id="${user.id}">Supprimer</button></td>
                `;
                userTableBody.appendChild(row);
            });

            // Ajouter les gestionnaires pour les boutons "Supprimer"
            document.querySelectorAll('.delete-button').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const userId = e.target.getAttribute('data-id');
                    const confirmDelete = confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?');
                    if (confirmDelete) {
                        await deleteUser(userId);
                    }
                });
            });
        } else {
            alert('Erreur lors du chargement des utilisateurs');
        }
    } catch (error) {
        console.error('Erreur :', error);
    }
}

// Fonction pour supprimer un utilisateur
async function deleteUser(userId) {
    try {
        const response = await fetch(`http://172.22.231.241:3000/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            alert('Utilisateur supprimé avec succès');
            loadUsers(); // Recharge la liste des utilisateurs
        } else {
            const errorData = await response.json();
            alert(`Erreur : ${errorData.message || 'Impossible de supprimer l\'utilisateur'}`);
        }
    } catch (error) {
        console.error('Erreur :', error);
        alert('Une erreur est survenue');
    }
}