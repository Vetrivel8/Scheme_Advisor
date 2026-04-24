require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const connectDB = require('../config/db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function debugRAG() {
  console.log('=== RAG Debug Test ===\n');

  // Step 1: Generate embedding
  console.log('1. Generating embedding...');
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent('small farmer subsidy irrigation agriculture');
  const vector = result.embedding.values;
  console.log(`   Embedding dimension: ${vector.length} ✅\n`);

  // Step 2: Vector search in Astra DB
  console.log('2. Searching Astra DB vector collection...');
  const db = connectDB();
  const keyspace = process.env.ASTRA_DB_KEYSPACE || 'default_keyspace';
  const collection = db.collection('schemes_vector', { keyspace });

  // Count documents first
  try {
    const count = await collection.countDocuments({}, 1000);
    console.log(`   Documents in collection: ${count}`);
  } catch (e) {
    console.log('   Could not count docs:', e.message);
  }

  const cursor = collection.find(
    {},
    {
      sort: { $vector: vector },
      limit: 5,
      includeSimilarity: true,
    }
  );

  const docs = await cursor.toArray();
  console.log(`   Search results: ${docs.length} documents found\n`);

  if (docs.length === 0) {
    console.log('   ❌ No results — collection may be empty or wrong keyspace');
  } else {
    docs.forEach((d, i) => {
      console.log(`   [${i + 1}] ${d.title?.en}`);
      console.log(`       Similarity: ${d.$similarity?.toFixed(4)} | Category: ${d.category}`);
    });
  }
}

debugRAG().catch(e => {
  console.error('FAILED:', e.message);
  console.error(e.stack);
  process.exit(1);
});
