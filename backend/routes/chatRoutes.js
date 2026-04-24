const express = require('express');
const router = express.Router();
const { runRAGPipeline } = require('../services/ragService');

// Load schemes for fallback
let allSchemes = [];
try {
  allSchemes = require('../data/schemes.json');
} catch (e) {
  console.warn('Could not load schemes.json for chatbot fallback');
}

/**
 * POST /api/chat
 * Body: {
 *   query:       string  — user's message
 *   profile:     object  — { age, income, occupation, location, residence, category }
 *   chatHistory: array   — [{ role: 'user'|'assistant', content: string }]
 *   lang:        string  — 'en' | 'ta'
 * }
 */
router.post('/', async (req, res) => {
  const { query, profile = null, chatHistory = [], lang = 'en' } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Query is required.' });
  }

  if (query.trim().length > 500) {
    return res.status(400).json({ error: 'Query too long. Keep it under 500 characters.' });
  }

  try {
    const result = await runRAGPipeline({
      query: query.trim(),
      profile,
      chatHistory,
      lang,
      allSchemes,
    });

    return res.json({
      reply: result.reply,
      sources: result.sources || [],
    });
  } catch (err) {
    console.error('Chat route error:', err.message);
    return res.status(500).json({
      reply: "I'm having trouble right now. Please try again in a moment!",
      sources: [],
    });
  }
});

module.exports = router;
