const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /price-history/:product_id
router.get("/:product_id", async (req, res) => {
  try {
    const { product_id } = req.params;

    const result = await pool.query(
      `SELECT price, recorded_at 
       FROM product_prices
       WHERE product_id = $1
       ORDER BY recorded_at ASC`,
      [product_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;