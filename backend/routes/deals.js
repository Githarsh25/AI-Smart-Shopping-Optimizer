const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /deals/:product_id
router.get("/:product_id", async (req, res) => {
  try {
    const product_id = req.params.product_id;

    // get last 10 prices
    const result = await pool.query(`
      SELECT price
      FROM product_prices
      WHERE product_id = $1
      ORDER BY recorded_at DESC
      LIMIT 10
    `, [product_id]);

    const prices = result.rows.map(r => Number(r.price));

    if (prices.length < 2) {
      return res.json({
        message: "Not enough data"
      });
    }

    const current_price = prices[0];

    // calculate average price
    const avg_price = prices.reduce((a, b) => a + b, 0) / prices.length;

    const discount_percentage = Math.round(
      ((avg_price - current_price) / avg_price) * 100
    );

    let deal = false;

    if (discount_percentage > 10) {
      deal = true;
    }

    res.json({
      deal,
      discount_percentage,
      current_price,
      average_price: Math.round(avg_price)
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;