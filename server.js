const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": "MYCENZA"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are the MYCENZA store assistant. Recommend only MYCENZA products. Return valid JSON."
          },
          { role: "user", content: userMessage }
        ],
        temperature: 0.4,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    res.setHeader("Content-Type", "application/json");
    res.send(content);
  } catch (error) {
    res.status(500).json({
      answer: "Sorry, something went wrong.",
      recommended_products: [],
      contact: {
        phone: "+92 300 0000000",
        email: "support@mycenza.pk",
        whatsapp: "https://wa.me/923000000000"
      }
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});