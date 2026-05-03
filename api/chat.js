export default async function handler(req, res) {
  // Allow CORS for Shopify
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: `You are a helpful assistant for MYCENZA, a Pakistani wellness/health brand. 
Answer questions about products concisely. If recommending a product, return JSON like:
{"answer": "your reply", "recommended_products": [{"title": "Product Name", "reason": "why", "url": "/products/slug"}]}
Otherwise just return: {"answer": "your reply", "recommended_products": []}`,
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '{}';
    
    try {
      const parsed = JSON.parse(text);
      return res.status(200).json(parsed);
    } catch {
      return res.status(200).json({ answer: text, recommended_products: [] });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ answer: 'Sorry, something went wrong.', recommended_products: [] });
  }
}
