const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /prices-by-name/:name
router.get("/:name", async (req, res) => {
  try {
    const name = req.params.name;

    const result = await pool.query(`
      SELECT p.name AS platform, pp.price
      FROM product_prices pp
      JOIN platforms p ON pp.platform_id = p.id
      JOIN products pr ON pp.product_id = pr.id
      WHERE LOWER(pr.name) LIKE LOWER($1)
      AND pp.recorded_at = (
        SELECT MAX(recorded_at)
        FROM product_prices
        WHERE product_id = pp.product_id
        AND platform_id = pp.platform_id
      )
    `, [`%${name}%`]);

    res.json(result.rows);

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;