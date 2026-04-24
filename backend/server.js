require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
// Explicit allowlist — no wildcard. Both env vars must be set in
// Vercel Dashboard → Project Settings → Environment Variables.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.HOSTED_FRONTEND_URL, // https://scheme-advisor.vercel.app
  process.env.FRONTEND_URL,        // fallback / preview URLs
].filter(Boolean).map(o => o.replace(/\/$/, '')); // strip trailing slash

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server / curl (no Origin header)
      if (!origin) return callback(null, true);
      const normalised = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalised)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

// ─── DB Init ─────────────────────────────────────────────────────────────────
const initDB = async () => {
  const db = connectDB();
  if (db) {
    try {
      const collections = await db.listCollections();
      const collectionNames = collections.map(c => c.name);

      if (!collectionNames.includes('users')) {
        await db.createCollection('users');
        console.log("Created 'users' collection.");
      }

      if (!collectionNames.includes('otps')) {
        await db.createCollection('otps');
        console.log("Created 'otps' collection.");
      }
    } catch (e) {
      console.warn(
        'Could not check/create Astra DB collections:',
        e.message
      );
    }
  }
};

initDB();

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// ─── Schemes ──────────────────────────────────────────────────────────────────
// Use require() instead of fs.readFileSync so the file is bundled at
// deploy time and available in Vercel's read-only serverless FS.
let schemes = [];
try {
  schemes = require('./data/schemes.json');
} catch (error) {
  console.error('Error loading schemes JSON:', error);
}

app.get('/api/schemes', (_req, res) => {
  res.json(schemes);
});

app.get('/api/schemes/:id', (req, res) => {
  const scheme = schemes.find(s => s.id === parseInt(req.params.id));
  if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
  res.json(scheme);
});

// Health-check — useful for debugging on Vercel
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV });
});

// ─── Local dev only ───────────────────────────────────────────────────────────
// Vercel imports `module.exports = app` and handles the HTTP layer itself.
// Calling app.listen() inside a serverless function causes a crash.
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
