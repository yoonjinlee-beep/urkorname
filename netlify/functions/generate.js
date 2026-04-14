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

    const prompt = `Create a beautiful Korean name for the foreign name: "${name}"

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
