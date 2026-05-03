module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message' });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://mycenza.pk',
        'X-Title': 'MYCENZA Chat Bot'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4-5',
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant for MYCENZA, a Pakistani health/wellness brand. Answer questions concisely. Always respond in this exact JSON format: {"answer": "your reply here", "recommended_products": []}`
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '{"answer":"Sorry, no response.","recommended_products":[]}';

    try {
      return res.status(200).json(JSON.parse(text));
    } catch {
      return res.status(200).json({ answer: text, recommended_products: [] });
    }

  } catch (err) {
    return res.status(500).json({ answer: 'Something went wrong.', recommended_products: [] });
  }
};
