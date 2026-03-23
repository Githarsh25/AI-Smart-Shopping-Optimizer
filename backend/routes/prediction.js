const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /price-prediction/:product_id
router.get("/:product_id", async (req, res) => {
  try {
    const product_id = req.params.product_id;

    // Get last 5 price records (latest first)
    const result = await pool.query(`
      SELECT price, recorded_at
      FROM product_prices
      WHERE product_id = $1
      ORDER BY recorded_at DESC
      LIMIT 5
    `, [product_id]);

    const prices = result.rows.map(r => Number(r.price)).reverse();

    if (prices.length < 2) {
      return res.json({
        message: "Not enough data for prediction"
      });
    }

    // Simple trend calculation
    let totalChange = 0;
    for (let i = 1; i < prices.length; i++) {
      totalChange += (prices[i] - prices[i - 1]);
    }

    const avgChange = totalChange / (prices.length - 1);

    const current_price = prices[prices.length - 1];
    const predicted_price = Math.round(current_price + avgChange);

    let recommendation = "Buy";

    if (predicted_price < current_price) {
      recommendation = "Wait";
    }

    res.json({
      current_price,
      predicted_price,
      recommendation
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;