require('dotenv').config();
const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost', port: 5000, path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr) }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

async function runTests() {
  console.log('=== Live HTTP Endpoint Tests ===\n');

  // Test 1: farmer query with profile
  console.log('Test 1: Farmer irrigation query...');
  const r1 = await post('/api/chat', {
    query: 'Is there any subsidy for irrigation as a small farmer?',
    profile: { age: 40, income: 80000, occupation: 'farmer', location: 'Madurai', residence: 'rural' },
    chatHistory: [], lang: 'en'
  });
  console.log('  Status:', r1.status);
  console.log('  Reply (preview):', r1.data.reply?.substring(0, 200));
  console.log('  Sources:', r1.data.sources?.length, 'found');
  console.log('  Source titles:', r1.data.sources?.map(s => s.title).join(' | '));

  // Test 2: no profile
  console.log('\nTest 2: No profile — education question...');
  const r2 = await post('/api/chat', {
    query: 'What scholarships are available for college students?',
    profile: null, chatHistory: [], lang: 'en'
  });
  console.log('  Status:', r2.status);
  console.log('  Reply (preview):', r2.data.reply?.substring(0, 200));

  // Test 3: Tamil input
  console.log('\nTest 3: Tamil language...');
  const r3 = await post('/api/chat', {
    query: 'விவசாயிகளுக்கு என்ன திட்டங்கள் உள்ளன?',
    profile: { age: 45, income: 60000, occupation: 'farmer' },
    chatHistory: [], lang: 'ta'
  });
  console.log('  Status:', r3.status);
  console.log('  Reply (preview):', r3.data.reply?.substring(0, 200));

  // Test 4: follow-up with chat history
  console.log('\nTest 4: Follow-up with chat history...');
  const r4 = await post('/api/chat', {
    query: 'What documents do I need?',
    profile: { age: 40, income: 80000, occupation: 'farmer' },
    chatHistory: [
      { role: 'user', content: 'Tell me about Sprinkler and Drip Irrigation scheme' },
      { role: 'assistant', content: 'Sprinkler and Drip Irrigation provides subsidy for farmers adopting micro-irrigation...' }
    ],
    lang: 'en'
  });
  console.log('  Status:', r4.status);
  console.log('  Reply (preview):', r4.data.reply?.substring(0, 200));

  console.log('\n=== All tests complete ===');
}

runTests().catch(e => console.error('FATAL:', e.message));
