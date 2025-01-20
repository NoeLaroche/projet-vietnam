const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  next();
});

// Stockage des réservations
const reservationsFile = './reservations.json';

app.get('/', (req, res) => {
  res.send('Backend fonctionnel !');
});

// Endpoint pour réserver une portion
app.post('/reserve', (req, res) => {
  const { name, fromName, message } = req.body;

  if (!name || !fromName || !message) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  // Charger les réservations existantes
  const reservations = JSON.parse(fs.readFileSync(reservationsFile, 'utf8') || '[]');

  // Vérifier si la portion est déjà réservée
  if (reservations.some(reservation => reservation.name === name)) {
    return res.status(400).json({ message: 'Cette portion est déjà réservée.' });
  }

  // Ajouter la réservation
  reservations.push({ name, fromName, message });
  fs.writeFileSync(reservationsFile, JSON.stringify(reservations, null, 2));

  res.json({ message: `Merci ! Vous avez réservé la portion "${name}" de la part de "${fromName}". Message : "${message}"` });
});

// Endpoint pour annuler une réservation
app.post('/cancel', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Nom de la portion requis pour annulation.' });
  }

  // Charger les réservations existantes
  const reservations = JSON.parse(fs.readFileSync(reservationsFile, 'utf8') || '[]');

  // Vérifier si la portion est réservée
  const index = reservations.findIndex(reservation => reservation.name === name);
  if (index === -1) {
    return res.status(400).json({ message: 'Cette portion n\'est pas réservée.' });
  }

  // Annuler la réservation
  reservations.splice(index, 1);
  fs.writeFileSync(reservationsFile, JSON.stringify(reservations, null, 2));

  res.json({ message: `Réservation de la portion "${name}" annulée.` });
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
