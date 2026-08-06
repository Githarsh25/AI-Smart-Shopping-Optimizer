const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/:product_id", async (req, res, next) => {
  try {
    const { product_id } = req.params;

    if (isNaN(product_id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }


    const result = await pool.query(
      `SELECT pp.price, pp.recorded_at, pl.name AS platform
       FROM product_prices pp
       JOIN platforms pl ON pp.platform_id = pl.id
       WHERE pp.product_id = $1
       ORDER BY pp.recorded_at ASC`,
      [product_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No price history found for this product" });
    }

    const rows = result.rows.map(r => ({
      price:       Number(r.price),
      recorded_at: new Date(r.recorded_at).toISOString(),
      platform:    r.platform,
    }));

    res.json(rows);

  } catch (err) {
    console.error(err.message);

    next(err);
  }
});

module.exports = router;