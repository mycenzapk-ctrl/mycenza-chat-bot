module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'No message' });

  /* ── PRODUCT CATALOG ── */
  const products = [
    {
      title: "Chaga Mushroom Capsules 1000MG",
      url: "https://mycenza.pk/products/chaga-mushroom-capsules-1000mg",
      description: "Premium Chaga mushroom (Inonotus obliquus) fruiting body extract. Rich in antioxidants, beta-glucans, and betulinic acid.",
      benefits: ["Powerful antioxidant protection", "Immune system support", "Anti-inflammatory", "Energy and vitality", "Skin health"],
      bestFor: "immunity, antioxidants, energy, inflammation, skin health, daily wellness",
      price: "Rs. 3,349.00",
      image: "https://mycenza-pk.myshopify.com/cdn/shop/files/chaga-mushroom-capsules.jpg"
    },
    {
      title: "Turkey Tail Capsules 1000MG",
      url: "https://mycenza.pk/products/turkey-tail-capsules-immune-gut-support",
      description: "Trametes versicolor fruiting body extract containing PSK and PSP compounds — among the most researched mushroom compounds.",
      benefits: ["Gut microbiome support", "Deep immune modulation", "PSK and PSP compounds", "Digestive health", "Recovery support"],
      bestFor: "gut health, digestion, immunity, microbiome, recovery, bloating, IBS",
      price: "Rs. 3,349.00",
      image: "https://mycenza-pk.myshopify.com/cdn/shop/files/turkey-tail-capsules.jpg"
    },
    {
      title: "Lion's Mane Capsules 1000MG",
      url: "https://mycenza.pk/products/lions-mane-capsules-cognitive-support",
      description: "Hericium erinaceus fruiting body extract. Stimulates Nerve Growth Factor (NGF) production for brain and nerve health.",
      benefits: ["Cognitive function", "Mental clarity & focus", "Memory support", "Nerve regeneration", "Mood balance"],
      bestFor: "brain fog, focus, memory, cognition, anxiety, depression, nerve health, study, work performance",
      price: "Rs. 3,349.00",
      image: "https://mycenza-pk.myshopify.com/cdn/shop/files/lions-mane-capsules.jpg"
    },
    {
      title: "Reishi Mushroom Capsules 1000MG",
      url: "https://mycenza.pk/products/reishi-mushroom-capsules-stress-sleep",
      description: "Ganoderma lucidum fruiting body extract — the 'Mushroom of Immortality'. Contains triterpenes and beta-glucans.",
      benefits: ["Stress relief & adaptogen", "Sleep quality improvement", "Immune regulation", "Cortisol balance", "Longevity support"],
      bestFor: "stress, anxiety, sleep, insomnia, cortisol, relaxation, adaptogen, longevity, immune",
      price: "Rs. 3,349.00",
      image: "https://mycenza-pk.myshopify.com/cdn/shop/files/reishi-mushroom-capsules.jpg"
    },
    {
      title: "Cordyceps Capsules 1000MG",
      url: "https://mycenza.pk/products/cordyceps-capsules-energy-performance",
      description: "Cordyceps militaris fruiting body extract. Boosts ATP production and oxygen utilization for peak physical performance.",
      benefits: ["Athletic performance", "Energy & stamina", "VO2 max support", "Libido & vitality", "Lung function"],
      bestFor: "energy, fatigue, athletic performance, endurance, stamina, libido, testosterone, workout, gym",
      price: "Rs. 3,349.00",
      image: "https://mycenza-pk.myshopify.com/cdn/shop/files/cordyceps-capsules.jpg"
    },
    {
      title: "MYCENZA Immunity Stack Bundle",
      url: "https://mycenza.pk/products/immunity-stack-bundle",
      description: "Chaga + Turkey Tail + Reishi bundle for complete immune system support and daily wellness.",
      benefits: ["Complete immune coverage", "Antioxidant & anti-inflammatory", "Gut and microbiome support", "Stress resilience"],
      bestFor: "immunity, bundle, value, complete health, immune boost, sick, virus, infection",
      price: "Rs. 8,499.00",
      image: "https://mycenza-pk.myshopify.com/cdn/shop/files/immunity-stack-bundle.jpg"
    },
    {
      title: "MYCENZA Performance Stack Bundle",
      url: "https://mycenza.pk/products/performance-stack-bundle",
      description: "Lion's Mane + Cordyceps bundle for mental and physical peak performance.",
      benefits: ["Brain + body performance", "Focus and stamina combined", "Study and training support"],
      bestFor: "performance, bundle, energy and focus, gym and study, athlete, student",
      price: "Rs. 5,999.00",
      image: "https://mycenza-pk.myshopify.com/cdn/shop/files/performance-stack-bundle.jpg"
    }
  ];

  /* ── SYSTEM PROMPT ── */
  const systemPrompt = `You are Zara, a warm and knowledgeable wellness guide for MYCENZA — a premium mushroom supplement brand based in Pakistan. Your role is to understand the customer's health concern and recommend the most suitable MYCENZA product(s).

MYCENZA PRODUCT CATALOG:
${products.map((p, i) => `
${i + 1}. ${p.title} — ${p.price}
   Best for: ${p.bestFor}
   Benefits: ${p.benefits.join(', ')}
   URL: ${p.url}
`).join('')}

GUIDELINES:
- Be warm, empathetic, and science-informed (never medical advice)
- Ask a clarifying question if the concern is vague
- Recommend 1–3 most relevant products based on the user's concern
- Keep your answer concise (2–4 sentences max)
- Always end with a call to action (e.g. "Would you like to learn more?")
- Never invent products outside the catalog above
- If no product fits, say so honestly and suggest contacting support

RESPONSE FORMAT — you MUST respond with valid JSON only, no markdown, no extra text:
{
  "answer": "Your conversational reply here",
  "recommended_products": [
    {
      "title": "exact product title from catalog",
      "url": "exact url from catalog",
      "image": "exact image url from catalog",
      "price": "exact price from catalog",
      "reason": "one short sentence why this product fits their concern"
    }
  ]
}

If no specific products are recommended (e.g. general question), return "recommended_products": []`;

  /* ── BUILD MESSAGES ── */
  const messages = [];

  // Add conversation history (cap at last 8 turns)
  const recentHistory = history.slice(-8);
  for (const turn of recentHistory) {
    if (turn.role === 'user' || turn.role === 'assistant') {
      messages.push({ role: turn.role, content: turn.content });
    }
  }

  // Add current user message
  messages.push({ role: 'user', content: message });

  /* ── CALL OPENROUTER ── */
  try {
    const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mycenza.pk',
        'X-Title': 'MYCENZA Chat Bot'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',       // fast + cheap — change if needed
        // model: 'openai/gpt-4o-mini',           // alternative
        // model: 'meta-llama/llama-3.1-8b-instruct:free', // free tier fallback
        max_tokens: 600,
        temperature: 0.4,
        system: systemPrompt,
        messages: messages,
        response_format: { type: 'json_object' } // enforce JSON output
      })
    });

    if (!openRouterRes.ok) {
      const errText = await openRouterRes.text();
      console.error('[MYCENZA] OpenRouter error:', openRouterRes.status, errText);
      return res.status(502).json({
        answer: "I'm having a moment — please try again in a few seconds.",
        recommended_products: []
      });
    }

    const orData = await openRouterRes.json();
    const rawContent = orData?.choices?.[0]?.message?.content || '';

    /* ── PARSE JSON RESPONSE ── */
    let parsed;
    try {
      // Strip markdown fences if model added them despite json_object mode
      const clean = rawContent.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.warn('[MYCENZA] JSON parse failed, raw:', rawContent);
      // Fallback: return raw text as answer with no products
      return res.status(200).json({
        answer: rawContent || "I couldn't understand that. Could you rephrase your question?",
        recommended_products: []
      });
    }

    /* ── ENRICH PRODUCTS (match catalog data to fill missing fields) ── */
    const enriched = (parsed.recommended_products || []).map(rec => {
      const match = products.find(p =>
        p.title.toLowerCase() === (rec.title || '').toLowerCase() ||
        (p.url && rec.url && p.url === rec.url)
      );
      return {
        title: rec.title || (match?.title ?? ''),
        url:   rec.url   || (match?.url   ?? '#'),
        image: rec.image || (match?.image ?? ''),
        price: rec.price || (match?.price ?? ''),
        reason: rec.reason || ''
      };
    });

    return res.status(200).json({
      answer: parsed.answer || "How can I help you today?",
      recommended_products: enriched
    });

  } catch (err) {
    console.error('[MYCENZA] Unexpected error:', err);
    return res.status(500).json({
      answer: "Something went wrong on my end. Please try again shortly.",
      recommended_products: []
    });
  }
};
