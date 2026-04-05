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
      SELECT pl.name AS platform, pp.price
      FROM (
        SELECT DISTINCT ON (platform_id)
          platform_id, price
        FROM product_prices
        WHERE product_id = $1
        ORDER BY platform_id, recorded_at DESC
      ) pp
      JOIN platforms pl ON pp.platform_id = pl.id
      ORDER BY pp.price ASC
    `, [product_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No prices found for this product" });
    }

    res.json(result.rows);

  } catch (error) {
    console.error(error.message);
    next(error);
  }
});

module.exports = router;