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
      SELECT platform_name AS platform, price
      FROM (
        SELECT DISTINCT ON (pp.platform_id)
          pl.name AS platform_name,
          pp.price
        FROM product_prices pp
        JOIN platforms pl ON pp.platform_id = pl.id
        WHERE pp.product_id = $1
        ORDER BY pp.platform_id, pp.recorded_at DESC
      ) latest
      ORDER BY price ASC
      LIMIT 1
    `, [product_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No pricing data found for this product" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error.message);

    next(error);
  }
});

module.exports = router;