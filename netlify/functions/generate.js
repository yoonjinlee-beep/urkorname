exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name } = JSON.parse(event.body);
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not found' })
      };
    }

    const prompt = `You are a Korean naming expert. Create a REAL Korean name for someone named "${name}".

Rules:
- The result must sound like a name a real Korean person would actually have
- Use only common Korean name syllables (e.g. 민, 준, 서, 연, 지, 현, 혁, 윤, 채, 은, 아, 영, 수, 진, 희)
- Avoid unusual or awkward combinations that no Korean would use
- Do NOT just transliterate (Michael → 마이클 is WRONG)
- Create a 3-syllable Korean name - The FIRST syllable must be the first sound of the original name (e.g. Angela → 안, Michael → 마, Dominic → 도) - This first syllable acts as the family name - The remaining 2 syllables are the given name - Example: Angela → 안지연, Michael → 마이현, Dominic → 도민혁 that sounds similar to the original
- Choose Hanja with beautiful positive meanings
- Should sound like a real Korean person's name
- Example: Michael → 미현, Dominic → 도민, Angela → 안지

Reply ONLY with this JSON, no markdown:
{
  "transliteration": "phonetic Korean spelling of original (e.g. 마이클)",
  "romanization": "romanized Korean name with dots (e.g. Mi · Hyun)",
  "characters": [
    { "hangul": "미", "hanja": "美", "meaning": "beautiful" },
    { "hangul": "현", "hanja": "賢", "meaning": "wise" }
  ]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || 'API error' })
      };
    }

    const text = data.content.map(b => b.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: clean
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
