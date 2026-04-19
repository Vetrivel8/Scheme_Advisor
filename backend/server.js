require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize DB Collections gracefully
const initDB = async () => {
  const db = connectDB();
  if (db) {
    try {
      // Astra DB collections check
      const collections = await db.listCollections();
      const collectionNames = collections.map(c => c.name);
      
      if (!collectionNames.includes('users')) {
        await db.createCollection('users');
        console.log("Created 'users' collection.");
      }
    } catch (e) {
      console.warn("Could not dynamically check/create Astra DB collections. Missing permissions or incorrect token?", e.message);
    }
  }
};

initDB();

// Routes
app.use('/api/auth', authRoutes);

// Load schemes data
const schemesPath = path.join(__dirname, 'data', 'schemes.json');
let schemes = [];
try {
  const data = fs.readFileSync(schemesPath, 'utf8');
  schemes = JSON.parse(data);
} catch (error) {
  console.error("Error loading schemes JSON:", error);
}

app.get('/api/schemes', (req, res) => {
  try {
    const data = fs.readFileSync(schemesPath, 'utf8');
    const freshSchemes = JSON.parse(data);
    res.json(freshSchemes);
  } catch (err) {
    res.json(schemes); // Fallback to startup data
  }
});

app.get('/api/schemes/:id', (req, res) => {
  try {
    const data = fs.readFileSync(schemesPath, 'utf8');
    const freshSchemes = JSON.parse(data);
    const scheme = freshSchemes.find(s => s.id === parseInt(req.params.id));
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });
    res.json(scheme);
  } catch (err) {
    const scheme = schemes.find(s => s.id === parseInt(req.params.id));
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });
    res.json(scheme);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
