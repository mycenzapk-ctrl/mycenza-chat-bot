export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};

    const products = [
      {
        title: "Chaga Mushroom Capsules 1000MG",
        url: "https://mycenza-pk.myshopify.com/products/chaga-mushroom-capsules-1000mg",
        reason: "Best for antioxidant and immune support"
      },
      {
        title: "Red Reishi Capsules 1000mg",
        url: "https://mycenza-pk.myshopify.com/products/red-reishi-capsules-1000mg",
        reason: "Best for calm, recovery, and vitality support"
      },
      {
        title: "Turkey Tail Capsules 1000mg",
        url: "https://mycenza-pk.myshopify.com/products/turkey-tail-capsules-1000mg",
        reason: "Best for gut and immune support"
      }
    ];

    const systemPrompt = `
You are the MYCENZA store assistant.
Recommend only MYCENZA products.
Return valid JSON with this shape:
{
  "answer": "string",
  "recommended_products": [
    { "title": "string", "url": "string", "reason": "string" }
  ],
  "contact": {
    "phone": "+92 300 0000000",
    "email": "support@mycenza.pk",
    "whatsapp": "https://wa.me/923000000000"
  }
}
Keep answers short, helpful, and natural.
Do not give medical diagnosis.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "https://mycenza-chat-bot.vercel.app",
        "X-Title": "MYCENZA"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "system", content: `Products: ${JSON.stringify(products)}` },
          { role: "user", content: message || "" }
        ],
        temperature: 0.4,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      answer: "Sorry, something went wrong.",
      recommended_products: [],
      contact: {
        phone: "+92 300 0000000",
        email: "support@mycenza.pk",
        whatsapp: "https://wa.me/923000000000"
      }
    });
  }
}