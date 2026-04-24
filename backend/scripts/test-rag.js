require('dotenv').config();
const { runRAGPipeline } = require('../services/ragService');
const schemes = require('../data/schemes.json');

async function test() {
  console.log('=== Full RAG Pipeline Test ===\n');

  const result = await runRAGPipeline({
    query: 'I am a small farmer, is there any subsidy for irrigation?',
    profile: {
      age: 40,
      income: 80000,
      occupation: 'farmer',
      location: 'Chennai',
      residence: 'rural',
      category: 'general'
    },
    chatHistory: [],
    lang: 'en',
    allSchemes: schemes
  });

  console.log('REPLY:\n', result.reply);
  console.log('\nSOURCES:');
  (result.sources || []).forEach(s => console.log('  -', s.title, '|', s.link));
}

test().catch(e => {
  console.error('FATAL ERROR:', e.message);
  console.error(e.stack);
});
