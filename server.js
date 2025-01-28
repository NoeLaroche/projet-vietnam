
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('reservations.json'); // Replace with your Firebase Admin SDK JSON file path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://projet-vietnam-b5c75-default-rtdb.firebaseio.com/', // Replace with your Firebase database URL
});

const db = admin.database();
const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  next();
});

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
    const reservationsRef = db.ref('reservations');
    const snapshot = await reservationsRef.orderByChild('name').equalTo(name).once('value');

    if (snapshot.exists()) {
      return res.status(400).json({ message: 'Cette portion est déjà réservée.' });
    }

    const newReservation = { name, fromName, message };
    await reservationsRef.push(newReservation);

    res.json({
      message: `Merci ! Vous avez réservé la portion "${name}" de la part de "${fromName}". Message : "${message}"`,
    });
  } catch (error) {
    console.error(error);
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
    const reservationsRef = db.ref('reservations');
    const snapshot = await reservationsRef.orderByChild('name').equalTo(name).once('value');

    if (!snapshot.exists()) {
      return res.status(400).json({ message: 'Cette portion n\'est pas réservée.' });
    }

    const updates = {};
    snapshot.forEach(child => {
      updates[child.key] = null; // Mark for deletion
    });

    await reservationsRef.update(updates);

    res.json({ message: `Réservation de la portion "${name}" annulée.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'annulation.' });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
