const express = require("express");
const router = express.Router();
const pool = require("../db");

// POST /cart/optimize
router.post("/optimize", async (req, res) => {
  try {
    const { products } = req.body;

    let cart = [];
    let total_cost = 0;

    for (let productName of products) {

      // 1. find product_id
      const productResult = await pool.query(
        "SELECT * FROM products WHERE LOWER(name) = LOWER($1)",
        [productName]
      );

      if (productResult.rows.length === 0) continue;

      const product_id = productResult.rows[0].id;

      // 2. get cheapest latest price
      const priceResult = await pool.query(`
        SELECT p.name AS platform, pp.price
        FROM product_prices pp
        JOIN platforms p ON pp.platform_id = p.id
        WHERE pp.product_id = $1
        AND pp.recorded_at = (
          SELECT MAX(recorded_at)
          FROM product_prices
          WHERE product_id = pp.product_id
          AND platform_id = pp.platform_id
        )
        ORDER BY pp.price ASC
        LIMIT 1
      `, [product_id]);

      if (priceResult.rows.length === 0) continue;

      const best = priceResult.rows[0];

      cart.push({
        product: productName,
        platform: best.platform,
        price: Number(best.price)
      });

      total_cost += Number(best.price);
    }

    res.json({
      cart,
      total_cost
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;