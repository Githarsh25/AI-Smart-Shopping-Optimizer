const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /prices/:product_id
router.get("/:product_id", async (req, res) => {
  try {
    const product_id = req.params.product_id;

    const result = await pool.query(`
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
    `, [product_id]);

    res.json(result.rows);

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;