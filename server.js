const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
const { getDatabase, ref, get, set, update, remove, push, child, query, orderByChild, equalTo } = require('firebase-admin/database');

const app = express();
const PORT = 3001;

// Hardcoded Firebase Admin SDK service account
const serviceAccount = {
  "type": "service_account",
  "project_id": "projet-vietnam-b5c75",
  "private_key_id": "06a5382cd2d631284f235d6401c99900ddd58169",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFA...",
  "client_email": "firebase-adminsdk-fbsvc@projet-vietnam-b5c75.iam.gserviceaccount.com",
  "client_id": "102318580616668148704",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40projet-vietnam-b5c75.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Middleware
app.use(cors({
  origin: ['https://noelaroche.github.io/projet-vietnam/code_perso_voyage.html'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://projet-vietnam-b5c75.firebaseio.com',
});
console.log('Firebase Admin SDK initialized successfully!');

const db = getDatabase();

// Endpoint test
app.get('/', (req, res) => {
  res.send('Backend fonctionnel avec Firebase !');
});

// Endpoint pour réserver une portion
app.post('/reserve', async (req, res) => {
  const { name, fromName, message } = req.body;
  if (!name || !fromName || !message) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    const reservationsRef = ref(db, 'reservations');
    const reservationsQuery = query(reservationsRef, orderByChild('name'), equalTo(name));
    const snapshot = await get(reservationsQuery);

    if (snapshot.exists()) {
      return res.status(400).json({ message: 'Cette portion est déjà réservée.' });
    }

    const newReservation = { name, fromName, message };
    await push(reservationsRef, newReservation);

    res.json({
      message: `Merci ! Vous avez réservé la portion "${name}" de la part de "${fromName}". Message : "${message}"`,
    });
  } catch (error) {
    console.error('Erreur Firebase:', error);
    res.status(500).json({ message: 'Erreur lors de la réservation.' });
  }
});

// Endpoint pour annuler une réservation
app.post('/cancel', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Nom de la portion requis pour annulation.' });
  }

  try {
    const reservationsRef = ref(db, 'reservations');
    const reservationsQuery = query(reservationsRef, orderByChild('name'), equalTo(name));
    const snapshot = await get(reservationsQuery);

    if (!snapshot.exists()) {
      return res.status(400).json({ message: 'Cette portion n\'est pas réservée.' });
    }

    const updates = {};
    snapshot.forEach((childSnapshot) => {
      updates[childSnapshot.key] = null; // Supprime l'entrée
    });

    await update(reservationsRef, updates);
    res.json({ message: `Réservation de la portion "${name}" annulée.` });
  } catch (error) {
    console.error('Erreur Firebase:', error);
    res.status(500).json({ message: 'Erreur lors de l\'annulation.' });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
