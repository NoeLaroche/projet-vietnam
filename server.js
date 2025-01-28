const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const PORT = 3001;

// Hardcoded Firebase Admin SDK service account
const serviceAccount = {
  "type": "service_account",
  "project_id": "projet-vietnam-b5c75",
  "private_key_id": "06a5382cd2d631284f235d6401c99900ddd58169",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDI2GupMAOFA54J\nh0SwD6opUilj9+63HiK17SduJnin1vh7/eU9SjVM3bcUXqdnotTpYx5h4vxezn84\ndEjHeFplPMuPv5PIwLoMMZif06vFt76osvyCascHOcuM7YUVziAz+bSK8BQ8k3QO\nmaIufDghUcz5rLRm+rvUWDsPt6Odm2I5Bw9a71wLleybBrdSrDGFvGmerhhrqDCY\n8NRL5n4fKlEq2n+lYkeeHqP4rOwIyid8w0o3utXMpNDSr7ZGcuYMCSYStr/dVnrc\nYn/jv9u0o/Bj+iV6p1Ff6K8nUlWiktUk/claSHz8BajpVc/uj+RCyi9AZpo1koVV\nvW4qDV5BAgMBAAECggEADi640i5+88vGGKPR1gw9IVmDwmNAcEjd/Z0cstq08XEs\n2ctGKUujXjqtJ3CUVK1QaJdPDsLRvGYg4LKBbdMnWvfDOMg384NR1Ujun0v6A2Zk\nExM/NnxmHTICbYCw7FHCag6A0RYpRP/KlboD6abBle9p+zAsCwuQlkA8Ehzkc7K5\nlw+lEdn0zsmXNNaiyMWYZqkVQtxTIslm7zTQkk1uebrG53J9at3gJA1Qc7og3S57\nFO8q8+qIMWT6twPcQAN7KuK1mh+V/TZA/jz5V5lwtcEnftzCJJYGClF0b0luZxtw\n2l68e/CdOuk64D7GfRDajZu/tSSjBz/VtfBr3Inp2wKBgQD4TCVUcuLe4ACPiXpv\nANb6PBXGh9TniwoQXOvNtT7t21EM52PaBUBxsmBXBemFZovsvuTNuiWiy8g8LsQx\n4sKsHj7OMv7hdfPTj0hwzBWCYoF1SlLVxfvbS1xgMjfWjWCE81Rw1Ay4jBMbMxXg\nfTbCk27yC/E5x2vZmwq2CV5hdwKBgQDPE28rbCCDqBS911XHXtuKThh8F/MzFX1n\nEloPm6RlIts2vDfXa05kt7qfKovnOs7aA7r/Rlu++qNbnhbMMHFBelTLWWDsA4+P\nWWJTp4V0F8qfdhfrQgGCgf5zhKQrzNvySzjy4x/eY5YTFWyecGqfrov74+NUP5AZ\nUQQaLhnsBwKBgQDyB++fePmS/VEumXkh+PSVKbqkMkWjilG+D4W/mDwGSXGhHXCk\n1deyvIjSay3tXj9o/88yhpAnN3MwzvlqEztl4XmhL+5pwbtybsnTQex5kyHUPiWu\nwfW2FqiuEGWDm34JOtQFw32+6rO5ILvjfsrBMkvEX0W955lGna38MfexEwKBgFB9\nW17jfpfuQ3GvO9ZtFqThyj6iCJQ4rC/eQEeE1hfBvre93W7MdQJNMCsiHJNaloDD\npnIHZS4MumaoQnBH/B3ZcRBBw5y5nZm4wrGFkigX/1iQTKfTVkbmRIOecTndPTkm\n6BHxGrgUuYbdcwT66Vb8P8k/QWPD+Tz98rxCYy0NAoGAW0RH1SRFZD7fKJ4k0bGk\nA5J5Xy9R1qubv2z/vPfzUkwN5WbODCv7qpl+LztvCVJHwZ71FS4qJ2+C89DnwuiW\nOsJ2yGgbV52AAKzhpjGV7QgbZ1tWQB8/DWKyObT1GLMarUY5xYlujOCF8SzaQeTA\nP0+lSp3U+U/a57qvwP75a2I=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@projet-vietnam-b5c75.iam.gserviceaccount.com",
  "client_id": "102318580616668148704",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40projet-vietnam-b5c75.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://projet-vietnam-b5c75.firebaseio.com',
});

console.log('Firebase Admin SDK initialized successfully!');


const db = admin.database();

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
    snapshot.forEach((child) => {
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
