module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message' });

  const products = [
    {
      title: "Chaga Mushroom Capsules 1000MG",
      url: "https://mycenza.pk/products/chaga-mushroom-capsules-1000mg",
      description: "Antioxidant-rich functional mushroom capsules. Best for immune support, balance, vitality and daily wellness routines. Contains naturally occurring antioxidant compounds."
    },
    {
      title: "Turkey Tail Capsules 1000MG",
      url: "https://mycenza.pk/products/turkey-tail-capsules-immune-gut-support",
      description: "Functional mushroom capsules with PSK and PSP compounds. Best for immune support, digestive wellness and gut health."
    },
    {
      title: "Red Reishi Capsules 1000MG",
      url: "https://mycenza.pk/products/red-reishi-capsules-1000mg",
      description: "Premium Ganoderma lucidum functional mushroom capsules. Best for immune support, stress balance, vitality and daily wellness."
    }
  ];

  const productList = products.map(p =>
    `- ${p.title}: ${p.description} | URL: ${p.url}`
  ).join('\n');

  const systemPrompt = `You are a helpful assistant for MYCENZA, a Pakistani health and wellness brand specializing in premium functional mushroom supplements.

Here are ALL the products available in our store:
${productList}

Rules:
1. Only recommend products from the list above — never suggest products we don't carry
2. Match customer needs to the right product based on their health concern
3. Always respond in this EXACT JSON format with no extra text outside it:
{"answer": "your helpful reply here", "recommended_products": [{"title": "Product Name", "reason": "one sentence on why this helps them", "url": "product url here"}]}
4. If no product matches, use empty array: "recommended_products": []
5. Be friendly, concise and helpful
6. You can recommend multiple products if relevant`;

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
        model: 'openai/gpt-3.5-turbo',
        max_tokens: 500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ answer: `Error: ${data.error.message}`, recommended_products: [] });
    }

    const text = data.choices?.[0]?.message?.content || '';

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.status(200).json(parsed);
      }
      return res.status(200).json({ answer: text, recommended_products: [] });
    } catch {
      return res.status(200).json({ answer: text, recommended_products: [] });
    }

  } catch (err) {
    return res.status(500).json({ answer: 'Something went wrong.', recommended_products: [] });
  }
};
