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
- Do NOT transliterate the name directly (e.g. Michael → 마이클 is WRONG)
- Create a proper Korean name that sounds phonetically SIMILAR to the original
- Use 2 syllables for the given name (like real Korean names: 민준, 서연, 지훈)
- Choose Hanja with beautiful, positive meanings
- The result should sound like a real Korean person's name

Example: Michael → 미현 (not 마이클), Dominic → 도민 (not 도미닉)

Reply ONLY with a JSON object, no markdown:
{
  "transliteration": "phonetic Korean spelling of original name (e.g. 마이클)",
  "romanization": "romanized Korean name with dots (e.g. Mi · Hyun)",
  "characters": [
    { "hangul": "미", "hanja": "美", "meaning": "beautiful" },
    { "hangul": "현", "hanja": "賢", "meaning": "wise" }
  ]
}`;
Reply ONLY with a JSON object, no markdown:
{
  "transliteration": "phonetic Korean spelling (e.g. 도미닉)",
  "romanization": "romanized name with dots (e.g. Do · Min · Hyuk)",
  "characters": [
    { "hangul": "도", "hanja": "道", "meaning": "the way" },
    { "hangul": "민", "hanja": "民", "meaning": "people" },
    { "hangul": "혁", "hanja": "赫", "meaning": "bright" }
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
