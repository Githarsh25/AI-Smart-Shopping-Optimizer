const express = require("express");
const router  = express.Router();
const axios   = require("axios");
const pool    = require("../db");

async function callAgent(agentName, messages, maxTokens = 500) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages,
        temperature: 0.2,
        max_tokens:  maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error(`${agentName} failed:`, err.response?.data || err.message);
    throw new Error(`${agentName} failed: ${err.message}`);
  }
}

// POST /ai/cart-agent
router.post("/", async (req, res, next) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "products must be a non-empty array" });
    }

    const productNames = products.map(p => p.toLowerCase().split(" ").slice(0, 3).join(" "));
    const conditions = productNames.map((_, i) => `LOWER(pr.name) LIKE $${i + 1}`).join(" OR ");

    const priceData = await pool.query(`
      SELECT
        pr.name   AS product,
        pl.name   AS platform,
        pp.price
      FROM (
        SELECT DISTINCT ON (product_id, platform_id)
          product_id, platform_id, price
        FROM product_prices
        ORDER BY product_id, platform_id, recorded_at DESC
      ) pp
      JOIN products  pr ON pp.product_id  = pr.id
      JOIN platforms pl ON pp.platform_id = pl.id
      WHERE ${conditions}
      ORDER BY pr.name, pp.price ASC
    `, productNames.map(k => `%${k}%`));

    if (priceData.rows.length === 0) {
      return res.status(404).json({
        message: "No price data found for cart items. Search for them first.",
      });
    }

    console.log("🤖 Agent 1 (Price Analyst) starting...");

    const agent1Output = await callAgent("Price Analyst Agent", [
      {
        role: "system",
        content: `You are a Price Analyst Agent. Your ONLY job is to analyze price data and output structured JSON.
You must respond with ONLY valid JSON. No explanation. No markdown. No code fences.
Use exactly this structure:
{
  "analysis": [
    {
      "product": "product name",
      "cheapest_platform": "platform name",
      "cheapest_price": 0,
      "most_expensive_price": 0,
      "platforms_compared": 0,
      "savings_vs_most_expensive": 0
    }
  ],
  "total_optimized_cost": 0,
  "total_savings": 0
}`,
      },
      {
        role: "user",
        content: `Analyze this price data. For each unique product, find the cheapest platform.
Calculate total_savings as the difference between buying everything at highest prices vs lowest.

Price data:
${JSON.stringify(priceData.rows, null, 2)}

Products in cart: ${products.join(", ")}`,
      },
    ]);

    const cleaned1  = agent1Output.replace(/```json|```/g, "").trim();
    const analysis  = JSON.parse(cleaned1);

    console.log("🤖 Agent 2 (Shopping Strategist) starting...");

    const agent2Output = await callAgent("Shopping Strategist Agent", [
      {
        role: "system",
        content: `You are a Shopping Strategist Agent working alongside a Price Analyst Agent.
You receive structured price analysis from the Price Analyst and create a clear,
friendly shopping strategy for an Indian consumer.
- Be specific: mention platform names and rupee amounts
- Highlight the total savings clearly
- Keep it under 80 words
- Use plain English, no jargon`,
      },
      {
        role: "user",
        content: `The Price Analyst Agent has completed its analysis. Here is the structured output:

${JSON.stringify(analysis, null, 2)}

Write a friendly shopping strategy for the user based on this analysis.`,
      },
    ], 200);

    res.json({
      optimized_cart:    analysis.analysis,
      total_cost:        analysis.total_optimized_cost,
      total_savings:     analysis.total_savings,
      ai_strategy:       agent2Output,
      pipeline: {
        agents_used:  ["Price Analyst Agent", "Shopping Strategist Agent"],
        pattern:      "Sequential Producer → Consumer",
        agent1_role:  "Data retrieval and structured price analysis",
        agent2_role:  "Natural language strategy generation",
      },
    });

  } catch (error) {
    console.error("Multi-agent error:", error.message);
    next(error);
  }
});

module.exports = router;