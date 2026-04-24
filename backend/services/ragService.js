const { GoogleGenerativeAI } = require('@google/generative-ai');
const connectDB = require('../config/db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Tamil Detection ──────────────────────────────────────────────────────────
function isTamil(text) {
  return /[\u0B80-\u0BFF]/.test(text);
}

// ─── Is quota/rate-limit error ───────────────────────────────────────────────
function isQuotaError(err) {
  return err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('Too Many Requests');
}

// ─── Translate text via Gemini ────────────────────────────────────────────────
async function translateText(text, targetLang) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const langName = targetLang === 'ta' ? 'Tamil' : 'English';
    const result = await model.generateContent(
      `Translate the following text to ${langName}. Return ONLY the translated text, nothing else.\n\n${text}`
    );
    return result.response.text().trim();
  } catch (err) {
    console.warn('Translation skipped (quota/error):', err.message?.substring(0, 80));
    return text; // graceful fallback: return original
  }
}

// ─── Generate Embedding ───────────────────────────────────────────────────────
async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// ─── Build searchable text for a scheme ──────────────────────────────────────
function buildSchemeText(scheme) {
  const cats = Array.isArray(scheme.category) ? scheme.category.join(', ') : (scheme.category || '');
  const tags = Array.isArray(scheme.tags) ? scheme.tags.join(', ') : '';
  return [
    `Scheme: ${scheme.title?.en || ''}`,
    `Department: ${scheme.department?.en || ''}`,
    `Eligibility: ${scheme.eligibility?.en || ''}`,
    `Benefits: ${scheme.benefits?.en || ''}`,
    `How to Apply: ${scheme.apply?.en || ''}`,
    `Category: ${cats}`,
    tags ? `Tags: ${tags}` : '',
  ].filter(Boolean).join('. ');
}

// ─── Vector Search in Astra DB ────────────────────────────────────────────────
async function searchSchemes(queryVector, limit = 10) {
  const db = connectDB();
  if (!db) throw new Error('DB not connected');

  const keyspace = process.env.ASTRA_DB_KEYSPACE || 'default_keyspace';
  const collection = db.collection('schemes_vector', { keyspace });

  const cursor = collection.find(
    {},
    {
      sort: { $vector: queryVector },
      limit,
      includeSimilarity: true,
    }
  );

  return await cursor.toArray();
}

// ─── Profile-based Scoring & Filtering ───────────────────────────────────────
function scoreScheme(scheme, profile, queryLower) {
  let score = scheme.$similarity ? scheme.$similarity * 5 : 0;

  if (!profile) return score;

  const age = parseInt(profile.age) || 0;
  const income = parseInt(profile.income) || Infinity;
  const occ = String(profile.occupation || '').toLowerCase().trim();
  const cat = String(profile.category || '').toLowerCase().trim();
  const residence = String(profile.residence || '').toLowerCase().trim();

  // Hard eligibility filter — penalise ineligible schemes
  if (scheme.minAge !== null && age > 0 && age < scheme.minAge) return -1;
  if (scheme.maxAge !== null && scheme.maxAge > 0 && age > scheme.maxAge) return -1;
  if (scheme.maxIncome !== null && income < Infinity && income > scheme.maxIncome) return -1;

  // Occupation → category bonus
  const occMap = {
    farmer: 'agriculture',
    student: 'education',
    woman: 'women',
    elderly: 'social welfare',
    employee: 'employment',
  };
  const mappedCat = occMap[occ] || occ;
  const schemeCats = (Array.isArray(scheme.category) ? scheme.category : [scheme.category])
    .map(c => String(c || '').toLowerCase());

  if (schemeCats.includes(mappedCat)) score += 3;
  if (cat && schemeCats.some(c => c.includes(cat))) score += 2;
  if (residence === 'rural' && (queryLower.includes('rural') || queryLower.includes('village'))) score += 1;
  if (scheme.maxIncome !== null && income <= scheme.maxIncome) score += 1;

  return score;
}

function filterAndRankSchemes(rawSchemes, profile, queryLower) {
  return rawSchemes
    .map(s => ({ ...s, _score: scoreScheme(s, profile, queryLower) }))
    .filter(s => s._score >= 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 5);
}

// ─── Smart Fallback (no Gemini needed — uses vector results directly) ─────────
function buildSmartFallback(schemes, profile, query) {
  if (schemes.length === 0) {
    return "I couldn't find schemes closely matching your question. Try browsing by category or rephrasing your query.";
  }

  const top = schemes.slice(0, 3);
  const profileInfo = profile
    ? `Based on your profile (${profile.occupation || 'general'}, ₹${profile.income || 'N/A'}/yr)`
    : 'Here are the most relevant results';

  let reply = `${profileInfo}, here are the best matching government schemes:\n\n`;

  top.forEach((s, i) => {
    const cats = Array.isArray(s.category) ? s.category.join(', ') : (s.category || 'General');
    reply += `**${i + 1}. ${s.title?.en || 'Unknown Scheme'}** (${cats})\n`;
    reply += `• **Benefits:** ${(s.benefits?.en || 'N/A').substring(0, 120)}...\n`;
    reply += `• **Eligibility:** ${(s.eligibility?.en || 'N/A').substring(0, 100)}...\n\n`;
  });

  reply += `To apply or get full details, click any scheme above or visit the official portal.`;
  return reply;
}

// ─── Category Fallback (if RAG + vector search both fail) ────────────────────
function categoryFallback(allSchemes, query) {
  const lc = query.toLowerCase();
  const cats = ['agriculture', 'education', 'women', 'employment', 'health', 'housing', 'social'];
  const matched = cats.find(c => lc.includes(c));

  if (matched) {
    const results = allSchemes
      .filter(s => {
        const sc = Array.isArray(s.category) ? s.category : [s.category];
        return sc.some(c => String(c).toLowerCase().includes(matched));
      })
      .slice(0, 3);

    if (results.length > 0) {
      return `Here are some **${matched.toUpperCase()}** schemes:\n\n` +
        results.map(s => `• **${s.title?.en}** — ${(s.benefits?.en || '').substring(0, 80)}...`).join('\n') +
        '\n\nAsk me about any of these for full details!';
    }
  }

  return "I can help with government schemes! Try asking:\n• 'Farmer subsidies for irrigation'\n• 'Education schemes for girls'\n• 'Health insurance for low income'";
}

// ─── Gemini Prompt Builder ────────────────────────────────────────────────────
function buildPrompt(query, profile, schemes, chatHistory) {
  const profileBlock = profile
    ? `Age: ${profile.age || '?'} | Income: ₹${profile.income || '?'} | Occupation: ${profile.occupation || '?'} | Location: ${profile.location || '?'} | Area: ${profile.residence || '?'} | Category: ${profile.category || '?'}`
    : 'No profile.';

  const historyBlock = chatHistory.length > 0
    ? chatHistory.slice(-4).map(m => `${m.role === 'user' ? 'User' : 'Bot'}: ${m.content}`).join('\n')
    : '';

  const schemesBlock = schemes.map((s, i) => {
    const cats = Array.isArray(s.category) ? s.category.join(', ') : (s.category || '');
    return `[${i + 1}] ${s.title?.en} | Category: ${cats} | Eligibility: ${s.eligibility?.en?.substring(0, 150)} | Benefits: ${s.benefits?.en?.substring(0, 150)} | Apply: ${s.apply?.en?.substring(0, 100)} | Link: ${s.link || 'N/A'}`;
  }).join('\n');

  return `You are a Tamil Nadu government scheme advisor. Be helpful, concise, and accurate.

USER: ${profileBlock}
${historyBlock ? `HISTORY:\n${historyBlock}\n` : ''}
QUESTION: "${query}"

SCHEMES FROM DATABASE:
${schemesBlock}

TASK: Answer the question using ONLY the above schemes. Check eligibility against user profile. Recommend best 1-3 matches with reasons. Use bullet points. End with one action step. Never invent data.`;
}

// ─── Main RAG Pipeline ────────────────────────────────────────────────────────
async function runRAGPipeline({ query, profile, chatHistory = [], lang = 'en', allSchemes = [] }) {
  let processQuery = query;

  // Step 1: Detect Tamil and translate to English for embedding
  const isInputTamil = isTamil(query);
  if (isInputTamil) {
    try {
      processQuery = await translateText(query, 'en');
    } catch (e) {
      processQuery = query; // use original if translation fails
    }
  }

  try {
    // Step 2: Generate query embedding
    const queryVector = await generateEmbedding(processQuery);

    // Step 3: Vector search in Astra DB
    const rawResults = await searchSchemes(queryVector, 10);

    // Step 4: Profile-based filter + ranking
    const rankedSchemes = filterAndRankSchemes(rawResults, profile, processQuery.toLowerCase());

    // Step 5: Try Gemini generation
    let reply;
    try {
      const prompt = buildPrompt(processQuery, profile, rankedSchemes, chatHistory.slice(-6));
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      reply = result.response.text().trim();
    } catch (geminiErr) {
      if (isQuotaError(geminiErr)) {
        // ── Graceful degradation: use vector results without AI ──
        console.warn('⚠ Gemini quota hit — using smart vector fallback');
        reply = buildSmartFallback(rankedSchemes, profile, processQuery);
      } else {
        throw geminiErr; // non-quota error — propagate
      }
    }

    // Step 6: Translate response to Tamil if needed
    if (lang === 'ta' || isInputTamil) {
      reply = await translateText(reply, 'ta');
    }

    return {
      reply,
      sources: rankedSchemes.slice(0, 3).map(s => ({
        id: s.scheme_id || s.id,
        title: s.title?.en || 'Unknown Scheme',
        link: s.link || null,
      })),
    };

  } catch (err) {
    console.error('RAG pipeline error:', err.message?.substring(0, 200));

    // Last resort: category-based text matching
    let fallback = categoryFallback(allSchemes, processQuery);
    if (lang === 'ta' || isInputTamil) {
      fallback = await translateText(fallback, 'ta').catch(() => fallback);
    }
    return { reply: fallback, sources: [] };
  }
}

module.exports = { runRAGPipeline, generateEmbedding, buildSchemeText, isTamil };
