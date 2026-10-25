const questions = [
  "Do you supply cumin?",
  "What forms is ginger available in?",
  "Which port do you ship from?",
  "Is Ashwagandha good for stress?"
];

async function testAi() {
  console.log('=== AI Verification Test Battery ===\n');
  for (const q of questions) {
    try {
      const res = await fetch('http://localhost:5000/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q })
      });
      const data = await res.json();
      console.log(`Q: "${q}"`);
      console.log(`Status: ${res.status}`);
      console.log(`Reply:\n${data.data?.reply || JSON.stringify(data)}\n`);
      console.log('-----------------------------------------------------\n');
    } catch (e) {
      console.error(`Error asking "${q}":`, e.message);
    }
  }
}

testAi();
