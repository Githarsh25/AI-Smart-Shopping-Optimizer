const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/:product_id", async (req, res, next) => {
  try {
    const product_id = req.params.product_id;

    if (isNaN(product_id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const result = await pool.query(`
      SELECT price, recorded_at
      FROM product_prices
      WHERE product_id = $1
      ORDER BY recorded_at DESC
      LIMIT 10
    `, [product_id]);

    const prices = result.rows.map(r => Number(r.price)).reverse();

    if (prices.length < 2) {
      return res.json({ message: "Not enough data for prediction" });
    }
    let weightedChange = 0;
    let totalWeight = 0;
    for (let i = 1; i < prices.length; i++) {
      const weight = i; 
      weightedChange += (prices[i] - prices[i - 1]) * weight;
      totalWeight += weight;
    }
    const avgChange = weightedChange / totalWeight;

    const current_price = prices[prices.length - 1];
    const predicted_price = Math.round(current_price + avgChange);

    let recommendation = "Buy Now";
    let reason = "";

    if (predicted_price < current_price) {
      recommendation = "Wait";
      reason = `Price likely to drop by ₹${current_price - predicted_price}`;
    } else if (predicted_price > current_price) {
      recommendation = "Buy Now";
      reason = `Price trending up by ₹${predicted_price - current_price} — buy before it rises`;
    } else {
      recommendation = "Buy Now";
      reason = "Price is stable";
    }

    const confidence = prices.length >= 8 ? "high" : prices.length >= 4 ? "medium" : "low";

    res.json({
      current_price,
      predicted_price,
      recommendation,
      reason,
      confidence,
    });

  } catch (error) {
    console.error(error.message);
    next(error);
  }
});

module.exports = router;