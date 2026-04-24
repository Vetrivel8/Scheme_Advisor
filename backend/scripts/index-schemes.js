/**
 * index-schemes.js
 * 
 * ONE-TIME SCRIPT — Run once to index all schemes into Astra DB with vector embeddings.
 * Usage: node scripts/index-schemes.js
 * 
 * This creates a 'schemes_vector' collection in Astra DB and upserts all schemes
 * with their Gemini-generated embeddings for semantic search.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { DataAPIClient } = require('@datastax/astra-db-ts');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const schemes = require('../data/schemes.json');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Build rich text string for embedding ────────────────────────────────────
function buildSchemeText(scheme) {
  const cats = Array.isArray(scheme.category)
    ? scheme.category.join(', ')
    : scheme.category || '';
  const tags = Array.isArray(scheme.tags) ? scheme.tags.join(', ') : '';

  return [
    `Scheme: ${scheme.title?.en || ''}`,
    `Department: ${scheme.department?.en || ''}`,
    `Category: ${cats}`,
    `Eligibility: ${scheme.eligibility?.en || ''}`,
    `Benefits: ${scheme.benefits?.en || ''}`,
    `How to Apply: ${scheme.apply?.en || ''}`,
    tags ? `Tags: ${tags}` : '',
  ].filter(Boolean).join('. ');
}

// ─── Generate embedding via Gemini ──────────────────────────────────────────
async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// ─── Sleep helper for rate limiting ─────────────────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Main indexing function ──────────────────────────────────────────────────
async function indexSchemes() {
  console.log('🚀 Starting scheme indexing...');
  console.log(`📋 Total schemes to index: ${schemes.length}`);

  // Connect to Astra DB
  const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
  const db = client.db(process.env.ASTRA_DB_API_ENDPOINT);
  const keyspace = process.env.ASTRA_DB_KEYSPACE || 'default_keyspace';

  // Check if collection exists, create if not
  let collection;
  try {
    const existingCollections = await db.listCollections({ keyspace });
    const names = existingCollections.map(c => c.name);

    if (!names.includes('schemes_vector')) {
      console.log('📦 Creating schemes_vector collection with vector support...');
      collection = await db.createCollection('schemes_vector', {
        keyspace,
        vector: {
          dimension: 3072,       // gemini-embedding-001 output dimension
          metric: 'cosine',      // cosine similarity for semantic search
        },
      });
      console.log('✅ Collection created!');
    } else {
      // Drop and recreate to ensure correct dimension
      console.log('🔄 Dropping old collection and recreating with correct dimension...');
      await db.dropCollection('schemes_vector', { keyspace });
      collection = await db.createCollection('schemes_vector', {
        keyspace,
        vector: {
          dimension: 3072,
          metric: 'cosine',
        },
      });
      console.log('✅ Collection recreated!');
    }
  } catch (err) {
    console.error('Error creating/accessing collection:', err.message);
    process.exit(1);
  }

  // Index each scheme
  let success = 0;
  let failed = 0;

  for (let i = 0; i < schemes.length; i++) {
    const scheme = schemes[i];
    try {
      const text = buildSchemeText(scheme);
      const vector = await generateEmbedding(text);

      // Prepare document for Astra DB
      const doc = {
        _id: String(scheme.id),
        scheme_id: scheme.id,
        $vector: vector,

        // Metadata for filtering and display
        title: scheme.title,
        department: scheme.department,
        eligibility: scheme.eligibility,
        benefits: scheme.benefits,
        apply: scheme.apply,
        category: scheme.category,
        tags: scheme.tags || [],
        minAge: scheme.minAge ?? null,
        maxAge: scheme.maxAge ?? null,
        maxIncome: scheme.maxIncome ?? null,
        link: scheme.link || null,
      };

      // Upsert the document (insert or replace)
      await collection.replaceOne(
        { _id: String(scheme.id) },
        doc,
        { upsert: true }
      );

      success++;
      process.stdout.write(`\r⚡ Indexed ${success}/${schemes.length} schemes...`);

      // Rate limit: 2 requests/sec to avoid Gemini quota issues
      await sleep(500);

    } catch (err) {
      failed++;
      console.error(`\n❌ Failed to index scheme ${scheme.id} (${scheme.title?.en}): ${err.message}`);
      // Wait longer on error before continuing
      await sleep(2000);
    }
  }

  console.log(`\n\n🎉 Indexing complete!`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed:  ${failed}`);
  console.log('\n🔍 Your RAG system is ready! Start the server and test the chatbot.');
  process.exit(0);
}

indexSchemes().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
