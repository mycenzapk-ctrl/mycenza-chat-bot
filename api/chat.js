module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, history = [] } = req.body || {};
    if (!message) return res.status(400).json({ error: 'No message' });

    const products = [
      {
        title: "Chaga Mushroom Capsules 1000MG",
        url: "https://mycenza.pk/products/chaga-mushroom-capsules-1000mg-antioxidant-immune-support-mycenza",
        description: "Chaga (Inonotus obliquus) is one of the most antioxidant-rich substances on Earth, scoring exceptionally high on the ORAC scale. MYCENZA's Chaga capsules use 100% fruiting body extract — no mycelium filler — standardised to active beta-glucans and betulinic acid. Chaga has been used in traditional Siberian and Asian medicine for centuries as an immune tonic and anti-ageing adaptogen. Modern research supports its role in reducing oxidative stress, modulating immune responses, supporting healthy inflammation levels, and promoting skin health through its melanin and antioxidant content.",
        benefits: [
          "Extremely high antioxidant (ORAC) score — fights free radical damage",
          "Immune system modulation via beta-glucans",
          "Supports healthy inflammation response",
          "Skin health — melanin and antioxidants protect skin cells",
          "Energy and daily vitality without stimulants",
          "Liver support and detoxification",
          "May support healthy blood sugar and cholesterol levels"
        ],
        bestFor: "immunity, antioxidants, energy, inflammation, skin health, anti-aging, oxidative stress, liver, daily wellness, general health",
        price: "Rs. 3,349.00",
        image: "https://mycenza-pk.myshopify.com/cdn/shop/files/chaga-mushroom-capsules.jpg"
      },
      {
        title: "Red Reishi Capsules 1000MG",
        url: "https://mycenza.pk/products/red-reishi-capsules-immune-vitality-support-1000mg",
        description: "Red Reishi (Ganoderma lucidum), known as the Mushroom of Immortality in traditional Chinese medicine, has over 2,000 years of documented use. MYCENZA's Red Reishi capsules deliver 1000mg of pure fruiting body extract rich in triterpenes (ganoderic acids), polysaccharides, and beta-glucans. Reishi is the most studied adaptogenic mushroom for stress, sleep, and immune regulation. Triterpenes give Reishi its signature bitter taste and are responsible for its calming, cortisol-regulating effects. It works by supporting the HPA (hypothalamic-pituitary-adrenal) axis — your body's central stress response system.",
        benefits: [
          "Powerful adaptogen — helps body manage physical and mental stress",
          "Improves sleep quality and depth",
          "Immune modulation",
          "Cortisol regulation",
          "Supports heart health and healthy blood pressure",
          "Anti-inflammatory and antioxidant protection",
          "Mood support — reduces anxiety and promotes calm focus",
          "Liver protection and detoxification support"
        ],
        bestFor: "stress, anxiety, sleep, insomnia, cortisol, relaxation, adaptogen, immune, heart health, mood, burnout, fatigue, vitality, longevity",
        price: "Rs. 3,349.00",
        image: "https://mycenza-pk.myshopify.com/cdn/shop/files/red-reishi-capsules.jpg"
      },
      {
        title: "Turkey Tail Capsules 1000MG",
        url: "https://mycenza.pk/products/turkey-tail-capsules-immune-gut-support-1000mg",
        description: "Turkey Tail (Trametes versicolor) is the most clinically researched medicinal mushroom in the world. MYCENZA's Turkey Tail capsules deliver 1000mg of 100% fruiting body extract containing PSK (Polysaccharide-K) and PSP (Polysaccharide-Peptide) — the two most studied immune-active compounds in mushroom science. PSK is so well-established that it is approved as a complementary cancer therapy adjunct in Japan. Turkey Tail directly feeds beneficial gut bacteria (Lactobacillus and Bifidobacterium strains), making it one of the most effective prebiotic mushrooms. A healthy gut is foundational to immunity, mood, digestion, and overall health.",
        benefits: [
          "Deep immune system activation via PSK and PSP compounds",
          "Powerful prebiotic — feeds good gut bacteria directly",
          "Gut microbiome restoration and diversity support",
          "Digestive health — reduces bloating, improves bowel regularity",
          "Post-antibiotic gut recovery",
          "Supports the gut-brain axis",
          "Anti-inflammatory in the gut lining",
          "Recovery support after illness or intense physical exertion"
        ],
        bestFor: "gut health, digestion, microbiome, immunity, bloating, IBS, bowel health, prebiotics, recovery, antibiotic recovery, leaky gut, inflammation",
        price: "Rs. 3,349.00",
        image: "https://mycenza-pk.myshopify.com/cdn/shop/files/turkey-tail-capsules.jpg"
      }
    ];

    const systemPrompt = `You are Zara, an expert wellness guide and supplement advisor for MYCENZA — a premium medicinal mushroom supplement brand based in Pakistan. You are knowledgeable, warm, educational, and genuinely helpful.

Your personality:
- You explain things in depth like a knowledgeable friend who is also a nutritionist
- You explain the science behind HOW and WHY a mushroom works, not just that it works
- You are conversational, empathetic, and curious about the customer's specific situation
- You give rich, detailed answers — never short, clipped one-liners
- You never give medical diagnoses or tell someone to stop prescribed medication
- You always recommend consulting a doctor for serious conditions, but you still give rich, useful information

MYCENZA CURRENT PRODUCT RANGE — ONLY these 3 products exist. Never recommend or invent others:

1. CHAGA MUSHROOM CAPSULES 1000MG — Rs. 3,349.00
   URL: ${products[0].url}
   About: ${products[0].description}
   Key benefits: ${products[0].benefits.join(' | ')}
   Best for: ${products[0].bestFor}

2. RED REISHI CAPSULES 1000MG — Rs. 3,349.00
   URL: ${products[1].url}
   About: ${products[1].description}
   Key benefits: ${products[1].benefits.join(' | ')}
   Best for: ${products[1].bestFor}

3. TURKEY TAIL CAPSULES 1000MG — Rs. 3,349.00
   URL: ${products[2].url}
   About: ${products[2].description}
   Key benefits: ${products[2].benefits.join(' | ')}
   Best for: ${products[2].bestFor}

HOW TO RESPOND:
- Give thorough, educational, multi-sentence answers
- Explain the mechanism — HOW the mushroom works at a biological level
- If someone mentions a health concern, acknowledge it with empathy, then explain which product helps and why
- Write in natural paragraphs
- If the question is general, give a thorough educational answer and naturally introduce relevant MYCENZA products at the end
- If comparing products, clearly explain the differences
- Ask a follow-up question when it would help personalize the recommendation
- End with a gentle call-to-action or invitation for further questions
- For dosage, timing, stacking: give clear practical guidance based on general mushroom supplement best practices
- For unrelated questions, politely redirect back to wellness goals

SAFETY RULES:
- Never claim any product cures or treats a disease
- For serious medical conditions, recommend consulting a doctor and explain how the mushroom may complement, not replace, treatment
- Never invent products outside the 3 listed above
- If their concern truly doesn't match any product, be honest and suggest they email support@mycenza.pk

RESPONSE FORMAT:
Return valid JSON only, with no markdown fences:
{
  "answer": "Your full detailed conversational reply. Multiple paragraphs allowed. Use \\n\\n between paragraphs for spacing.",
  "recommended_products": [
    {
      "title": "exact product title from the catalog above",
      "url": "exact url from the catalog above",
      "image": "exact image url from the catalog above",
      "price": "exact price from the catalog above",
      "reason": "one sentence explaining why this specific product fits their concern"
    }
  ]
}

If no product recommendation applies, return: { "answer": "...", "recommended_products": [] }`;

    const messages = [{ role: 'system', content: systemPrompt }];

    for (const turn of history.slice(-10)) {
      if (turn && (turn.role === 'user' || turn.role === 'assistant')) {
        messages.push({ role: turn.role, content: String(turn.content || '') });
      }
    }
    messages.push({ role: 'user', content: String(message) });

    const MODELS = [
      'deepseek/deepseek-chat-v3-0324:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemini-2.0-flash-exp:free'
    ];

    let lastError = null;

    for (const model of MODELS) {
      try {
        const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://mycenza.pk',
            'X-Title': 'MYCENZA Zara Chat Assistant'
          },
          body: JSON.stringify({
            model,
            max_tokens: 1200,
            temperature: 0.65,
            messages,
            response_format: { type: 'json_object' }
          })
        });

        const text = await orRes.text();

        if (!orRes.ok) {
          lastError = `HTTP ${orRes.status}: ${text.slice(0, 200)}`;
          continue;
        }

        let orData;
        try {
          orData = JSON.parse(text);
        } catch {
          lastError = 'Invalid JSON from OpenRouter';
          continue;
        }

        const rawContent = orData?.choices?.[0]?.message?.content || '';
        if (!rawContent) {
          lastError = 'Empty model response';
          continue;
        }

        let parsed;
        try {
          const clean = rawContent
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();
          parsed = JSON.parse(clean);
        } catch {
          return res.status(200).json({
            answer: rawContent,
            recommended_products: []
          });
        }

        const enriched = (parsed.recommended_products || []).map(rec => {
          const match = products.find(p => p.title === rec.title);
          return {
            title: rec.title || match?.title || '',
            url: rec.url || match?.url || '#',
            image: rec.image || match?.image || '',
            price: rec.price || match?.price || '',
            reason: rec.reason || ''
          };
        }).filter(p => p.title);

        return res.status(200).json({
          answer: parsed.answer || 'How can I help you with your wellness goals today?',
          recommended_products: enriched
        });
      } catch (err) {
        lastError = err.message;
      }
    }

    return res.status(200).json({
      answer: "I'm having a moment right now. Please try again in a few seconds — I'll be back shortly!",
      recommended_products: []
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Server error',
      details: err.message
    });
  }
};
