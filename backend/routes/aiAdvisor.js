const express = require("express");
const router  = require("express").Router();
const axios   = require("axios");

router.post("/", async (req, res, next) => {
  try {
    const { product_name, prices, prediction, deal } = req.body;

    if (!product_name || !prices) {
      return res.status(400).json({ message: "product_name and prices are required" });
    }

    const systemPrompt = `You are an expert shopping advisor for Indian consumers.
You have deep knowledge of Indian e-commerce platforms like Amazon India, Flipkart, Croma, Reliance Digital.

You MUST respond ONLY with a valid JSON object. No explanation before or after. No markdown. No code fences.
Use exactly this structure:
{
  "verdict": "Buy Now" or "Wait" or "Good Deal",
  "summary": "2-3 sentence plain English recommendation mentioning specific platforms and prices",
  "best_platform": "name of cheapest platform",
  "risk_level": "Low" or "Medium" or "High",
  "key_insight": "one specific insight about this product's pricing trend",
  "buy_reason": "one sentence on why to buy now OR why to wait"
}`;

    const userPrompt = `Product: ${product_name}

Current prices across platforms:
${JSON.stringify(prices, null, 2)}

Price prediction analysis:
${JSON.stringify(prediction, null, 2)}

Deal analysis:
${JSON.stringify(deal, null, 2)}

Based on this data, should an Indian consumer buy this product now or wait?`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt   },
        ],
        temperature: 0.2,    
        max_tokens:  400,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw = response.data.choices[0].message.content.trim();


    const cleaned = raw.replace(/```json|```/g, "").trim();
    const advice  = JSON.parse(cleaned);

    res.json(advice);

  } catch (error) {
    console.error("AI Advisor error:", error.response?.data || error.message);
    res.json({
      verdict:      "Check Manually",
      summary:      "AI advisor is temporarily unavailable. Please compare prices manually.",
      best_platform: "Unknown",
      risk_level:   "Medium",
      key_insight:  "Unable to generate insight at this time.",
      buy_reason:   "Please try again in a moment.",
    });
  }
});

module.exports = router;