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
      SELECT price
      FROM product_prices
      WHERE product_id = $1
      ORDER BY recorded_at DESC
      LIMIT 20
    `, [product_id]);

    const prices = result.rows.map(r => Number(r.price));

    if (prices.length < 2) {
      return res.json({ message: "Not enough data" });
    }

    const current_price = prices[0];

    const avg_price = prices.reduce((a, b) => a + b, 0) / prices.length;

    const discount_percentage = Math.round(
      ((avg_price - current_price) / avg_price) * 100
    );

    const all_time_low = Math.min(...prices);
    const is_all_time_low = current_price <= all_time_low;

    let deal = false;
    if (discount_percentage > 10) {
      deal = true;
    }

    res.json({
      deal,
      discount_percentage,
      current_price,
      average_price: Math.round(avg_price),
      is_all_time_low,
      data_points_used: prices.length,
    });

  } catch (error) {
    console.error(error.message);
    next(error);
  }
});

module.exports = router;