const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const XLSX = require('xlsx');
const app = express();

const DATA_FILE = './data/data.json';
let employeeData = []; // Stocker les employés en mémoire

// Configurer Multer pour les fichiers Excel
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://172.22.231.241', // Domaine du frontend
    credentials: true,              // Autorise les cookies
    allowedHeaders: ['Content-Type', 'Authorization'], // Autorise les headers personnalisés
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']  // Méthodes HTTP autorisées
}));

// *******************************
// Routes pour la gestion des stocks
// *******************************

// Charger les données depuis le fichier JSON
app.get('/stocks', (req, res) => {
    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la lecture des données.' });
        }
        res.json(JSON.parse(data));
    });
});

// Ajouter une nouvelle entrée
app.post('/stocks', (req, res) => {
    const newEntry = req.body;

    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la lecture des données.' });
        }

        const stockList = JSON.parse(data);
        stockList.push(newEntry);

        fs.writeFile(DATA_FILE, JSON.stringify(stockList, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de l\'écriture des données.' });
            }
            res.status(201).json(newEntry);
        });
    });
});

// Supprimer une ligne spécifique
app.delete('/stocks/:index', (req, res) => {
    const index = parseInt(req.params.index);

    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la lecture des données.' });
        }

        const stockList = JSON.parse(data);

        if (index < 0 || index >= stockList.length) {
            return res.status(400).json({ error: 'Index invalide.' });
        }

        stockList.splice(index, 1); // Supprimer l'élément à l'index donné

        fs.writeFile(DATA_FILE, JSON.stringify(stockList, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de l\'écriture des données.' });
            }
            res.status(204).send(); // Réponse sans contenu
        });
    });
});

// Modifier une ligne spécifique
app.put('/stocks/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const updatedEntry = req.body;

    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la lecture des données.' });
        }

        const stockList = JSON.parse(data);

        if (index < 0 || index >= stockList.length) {
            return res.status(400).json({ error: 'Index invalide.' });
        }

        stockList[index] = updatedEntry; // Mettre à jour l'entrée à l'index donné

        fs.writeFile(DATA_FILE, JSON.stringify(stockList, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de l\'écriture des données.' });
            }
            res.status(200).json(updatedEntry); // Retourner l'entrée mise à jour
        });
    });
});

// *******************************
// Routes pour la gestion des employés
// *******************************

// Charger un fichier Excel pour les employés
app.post('/upload-employees', upload.single('file'), (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).send('Aucun fichier téléchargé.');
    }

    // Lire le fichier Excel
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convertir en JSON
    employeeData = XLSX.utils.sheet_to_json(sheet);

    res.json({ message: 'Fichier chargé avec succès.', data: employeeData });
});

// Rechercher des employés
app.get('/search-employees', (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : '';
    const filteredData = employeeData.filter(employee =>
        Object.values(employee).some(value =>
            String(value).toLowerCase().includes(query)
        )
    );
    res.json(filteredData);
});

// *******************************
//       GESTION LOGIN
// *******************************

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const USERS_FILE = './data/users.json';
const SECRET_KEY = 'your_secret_key'; // À sécuriser dans des variables d'environnement

app.use(cookieParser());

// Fonction pour lire les utilisateurs depuis le fichier JSON
function readUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

// Fonction verif token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        console.log('Aucun token reçu');
        return res.status(401).send('Accès refusé : Aucun token fourni');
    }

    const token = authHeader.split(' ')[1]; // Extraire le token après "Bearer"

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.log('Erreur de vérification du token :', err.message);
            return res.status(403).send('Accès refusé : Token invalide');
        }

        console.log('Token valide pour :', user);
        req.user = user; // Stocker les informations utilisateur dans req pour les autres middlewares/routes
        next(); // Passer à la route suivante
    });
}

// API : Connexion
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (!user || !(bcrypt.compareSync(password, user.password))) {
        return res.status(400).send('Invalid credentials');
    }

    // Générer le token JWT
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

    // Afficher le token dans la console
    console.log('Token généré :', token);

    // Envoyer le token dans la réponse
    res.json({ token }); // Retourne le token directement
});

// Route protégée
app.get('/protected', authenticateToken, (req, res) => {
    res.send(`Bienvenue, ${req.user.username}`);
});

// Route pour vérifier les informations utilisateur
app.get('/user-info', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).send('Accès refusé : Aucun token fourni');
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).send('Accès refusé : Token invalide');
        }

        res.json(user); // Retourne les informations utilisateur
    });
});

// Fonction pour écrire dans le fichier JSON
function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Liste des utilisateurs (Admin seulement)
app.get('/admin/users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Accès refusé : Privilèges insuffisants');
    }
    const users = readUsers();
    res.json(users.map(u => ({ id: u.id, username: u.username, role: u.role, created_at: u.created_at })));
});

// Inscription d'un utilisateur
app.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Vérification du token JWT
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ error: 'Accès refusé : Aucun token fourni' });

        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET_KEY, async (err, user) => {
            if (err) return res.status(403).json({ error: 'Token invalide' });

            // Vérification si la demande provient d'un administrateur
            const isAdmin = user.role === 'admin';

            // Pour les auto-inscriptions (utilisateurs non admin), interdire l'ajout d'autres rôles
            if (!isAdmin && role && role !== 'user') {
                return res.status(403).json({ error: 'Vous ne pouvez pas attribuer ce rôle' });
            }

            const users = readUsers();

            // Vérification si l'utilisateur existe déjà
            if (users.some(u => u.username === username)) {
                return res.status(400).json({ error: 'Cet utilisateur existe déjà' });
            }

            // Création d'un nouvel utilisateur
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = {
                id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
                username,
                password: hashedPassword,
                role: role || 'user',
                created_at: new Date().toISOString()
            };

            users.push(newUser);
            writeUsers(users);

            res.status(201).json({ message: 'Utilisateur ajouté avec succès', user: { id: newUser.id, username: newUser.username, role: newUser.role } });
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription de l\'utilisateur :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// API : Suppression d'un utilisateur (Admin seulement)
app.delete('/admin/users/:id', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).send('Access Denied: No Token Provided');

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).send('Access Denied: No Token Provided');

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).send('Invalid Token');
        if (user.role !== 'admin') return res.status(403).send('Access Denied: Admins Only');

        const users = readUsers();
        const userId = parseInt(req.params.id, 10);
        const newUsers = users.filter(u => u.id !== userId);

        if (users.length === newUsers.length) {
            return res.status(404).send('User not found');
        }

        writeUsers(newUsers);
        res.send('User deleted');
    });
});



// Lancer le serveur
app.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});