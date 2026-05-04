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
      description: "Premium Chaga mushroom (Inonotus obliquus) fruiting body extract. Rich in antioxidants, beta-glucans, and betulinic acid. Supports immune system modulation, reduces oxidative stress, balances blood sugar, and promotes overall vitality. Ideal for people exposed to pollution, chronic stress, or those wanting daily immune reinforcement.",
      benefits: ["Powerful antioxidant protection", "Immune system support", "Anti-inflammatory", "Energy and vitality", "Skin health"],
      bestFor: "immunity, antioxidants, energy, inflammation, skin health, daily wellness",
      price: "Rs. 3,349.00",
      image: "https://mycenza-pk.myshopify.com/cdn/shop/files/chaga-mushroom-capsules.jpg"
    },
    {
      title: "Turkey Tail Capsules 1000MG",
      url: "https://mycenza.pk/products/turkey-tail-capsules-immune-gut-support",
      description: "Trametes versicolor fruiting body extract containing PSK (Polysaccharide-K) and PSP compounds — among the most researched mushroom compounds in clinical literature. Directly feeds beneficial gut bacteria, strengthens immune response, and supports gut-immune axis function. Best for people with digestive issues, weakened immunity, or those recovering from illness.",
      benefits: ["Gut microbiome support", "Deep immune modulation", "PSK and PSP compounds", "Digestive health", "Recovery support"],
      bestFor: "gut health, digestion, immunity, microbiome, recovery, bloating, IBS",
      price: "Rs. 3,349.00",
      image: "https://mycenza-pk.myshopify.com/cdn/shop/files/turkey-tail-capsules.jpg"
    },
    {
      title: "Red Reishi Capsules 1000MG",
      url: "https://mycenza.pk/products/red-reishi-capsules-1000mg",
      description: "Ganoderma lucidum fruiting body dual extract — the most studied adaptogenic mushroom in traditional medicine. Contains triterpenes and beta-glucans that calm the nervous system, regulate cortisol, improve sleep architecture, and balance immune function. Called the 'mushroom of immortality' in Chinese medicine. Best for people with stress, poor sleep, anxiety, or hormonal imbalance.",
      benefits: ["Stress and cortisol reduction", "Deep sleep improvement", "Adaptogenic calm", "Hormone balance", "Immune regulation"],
      bestFor: "stress, anxiety, sleep, insomnia, cortisol, calm, relaxation, mood, hormones",
      price: "Rs. 3,349.00",
      image: "https://mycenza-pk.myshopify.com/cdn/shop/files/red-reishi-capsules.jpg"
    }
  ];

  const productContext = products.map(p =>
    `PRODUCT: ${p.title}
PRICE: ${p.price}
URL: ${p.url}
BEST FOR: ${p.bestFor}
DESCRIPTION: ${p.description}
KEY BENEFITS: ${p.benefits.join(', ')}`
  ).join('\n\n---\n\n');

  const systemPrompt = `You are Zara, a knowledgeable wellness consultant for MYCENZA — a premium Pakistani functional mushroom supplement brand. You have deep expertise in adaptogens, functional mushrooms, and holistic health.

AVAILABLE PRODUCTS:
${productContext}

YOUR PERSONALITY:
- Warm, knowledgeable, and genuinely helpful like a trusted health advisor
- You explain the science simply but don't oversimplify
- You ask follow-up questions when needed to give better recommendations
- You are conversational, not robotic

HOW TO RESPOND:
1. Always give a thorough, helpful answer (3-5 sentences minimum for health questions)
2. Explain WHY a product helps — mention the active compounds, mechanisms, and expected timeline
3. If someone has a health concern, empathize first, then explain
4. Mention realistic timelines: most people notice results in 2-4 weeks with consistent use
5. If a question is not product-related (general mushroom knowledge, health questions, brand questions), answer it fully and helpfully
6. Always recommend the most relevant product(s) — never leave recommended_products empty if there is any relevant match
7. You can recommend multiple products if the person has multiple concerns

RESPONSE FORMAT — you must ALWAYS respond in this exact JSON format with no text outside it:
{"answer": "your detailed helpful response here", "recommended_products": [{"title": "exact product title", "reason": "specific one-sentence reason why this helps their exact concern", "url": "product url"}]}

IMPORTANT: 
- "answer" must be warm, detailed and genuinely helpful — minimum 3 sentences
- Only use products from the list above
- Match product titles exactly as written
- Empty array only if the question is completely unrelated to health/wellness`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://mycenza.pk',
        'X-Title': 'MYCENZA Zara Assistant'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-8b-instruct:free',
        max_tokens: 800,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        answer: `I'm having a moment — please try again in a few seconds.`, 
        recommended_products: [] 
      });
    }

    const text = data.choices?.[0]?.message?.content || '';

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.recommended_products && parsed.recommended_products.length) {
          parsed.recommended_products = parsed.recommended_products.map(rec => {
            const match = products.find(p => 
              p.url === rec.url || 
              p.title === rec.title ||
              p.title.toLowerCase().includes(rec.title?.toLowerCase()?.split(' ')[0] || '')
            );
            return {
              ...rec,
              image: match?.image || '',
              price: match?.price || ''
            };
          });
        }
        return res.status(200).json(parsed);
      }
      return res.status(200).json({ answer: text, recommended_products: [] });
    } catch {
      return res.status(200).json({ answer: text, recommended_products: [] });
    }

  } catch (err) {
    return res.status(500).json({ 
      answer: 'Something went wrong on my end. Please try again!', 
      recommended_products: [] 
    });
  }
};
