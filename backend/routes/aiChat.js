const express = require("express");
const router  = express.Router();
const axios   = require("axios");
const pool    = require("../db");

// POST /ai/chat
router.post("/", async (req, res, next) => {
  try {
    const { question, conversation_history = [] } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: "Question cannot be empty" });
    }

    const stopWords = new Set(["the","a","an","is","are","was","were","what","which",
      "when","where","how","much","does","cost","price","buy","should","i","me","my",
      "for","to","of","in","on","at","with","from","about","tell","give","find"]);

    const keywords = question.toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .filter(w => w.length > 2 && !stopWords.has(w))
      .slice(0, 4);

    let retrievedContext  = "";
    let productsFound     = 0;

    if (keywords.length > 0) {
      const conditions   = keywords.map((_, i) => `LOWER(pr.name) LIKE $${i + 1}`).join(" OR ");
      const params       = keywords.map(k => `%${k}%`);


      const priceResult = await pool.query(`
        SELECT
          pr.name        AS product,
          pl.name        AS platform,
          pp.price,
          pp.recorded_at
        FROM (
          SELECT DISTINCT ON (product_id, platform_id)
            product_id, platform_id, price, recorded_at
          FROM product_prices
          ORDER BY product_id, platform_id, recorded_at DESC
        ) pp
        JOIN products  pr ON pp.product_id  = pr.id
        JOIN platforms pl ON pp.platform_id = pl.id
        WHERE ${conditions}
        ORDER BY pr.name, pp.price ASC
        LIMIT 15
      `, params);

      const trendResult = await pool.query(`
        SELECT
          pr.name AS product,
          ROUND(MIN(pp.price))  AS lowest_ever,
          ROUND(MAX(pp.price))  AS highest_ever,
          ROUND(AVG(pp.price))  AS average_price,
          COUNT(*)              AS data_points
        FROM product_prices pp
        JOIN products pr ON pp.product_id = pr.id
        WHERE ${conditions}
        GROUP BY pr.name
        LIMIT 5
      `, params);

      productsFound = priceResult.rows.length;

      if (productsFound > 0) {


        const priceLines = priceResult.rows.map(r =>
          `• ${r.product} on ${r.platform}: ₹${Number(r.price).toLocaleString("en-IN")} (recorded ${new Date(r.recorded_at).toLocaleDateString("en-IN")})`
        );

        const trendLines = trendResult.rows.map(r =>
          `• ${r.product}: lowest ever ₹${Number(r.lowest_ever).toLocaleString("en-IN")}, highest ₹${Number(r.highest_ever).toLocaleString("en-IN")}, average ₹${Number(r.average_price).toLocaleString("en-IN")} (based on ${r.data_points} price records)`
        );

        retrievedContext = `
CURRENT PRICES FROM DATABASE:
${priceLines.join("\n")}

PRICE HISTORY SUMMARY:
${trendLines.join("\n")}`.trim();
      }
    }

    const systemPrompt = retrievedContext
      ? `You are an AI shopping assistant for an Indian price comparison platform.
You help users make smart buying decisions using REAL price data from the platform's database.

RETRIEVED DATA (use this as your only source for prices):
${retrievedContext}

RULES:
- Answer ONLY from the data provided above. Never invent prices.
- If the data doesn't contain what the user asked, say "I don't have that product in our database yet — try searching for it first."
- Always mention specific prices and platform names from the data.
- Keep answers to 3-4 sentences max.
- Format currency as ₹XX,XXX (Indian format).`
      : `You are an AI shopping assistant for an Indian price comparison platform.
No specific product data was found for this question.
Give general, helpful shopping advice for Indian consumers (Amazon India, Flipkart, Croma, Reliance Digital).
Suggest the user search for the specific product on the platform to get real price data.
Keep answers brief and helpful.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversation_history.slice(-6),
      { role: "user",   content: question },
    ];

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model:       "llama3-8b-8192",
        messages,
        temperature: 0.4,
        max_tokens:  350,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const answer = response.data.choices[0].message.content;

    res.json({
      answer,
      context_used:   productsFound > 0,
      products_found: productsFound,
      assistant_message: { role: "assistant", content: answer },
    });

  } catch (error) {
    console.error("RAG Chat error:", error.response?.data || error.message);
    next(error);
  }
});

module.exports = router;