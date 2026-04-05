const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /price-history/:product_id
router.get("/:product_id", async (req, res, next) => {
  try {
    const { product_id } = req.params;

    // CHANGE 1: Added input validation
    // Before: no check — a non-numeric ID caused a Postgres error
    if (isNaN(product_id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // CHANGE 2: Added platform name to response
    // Before: only returned { price, recorded_at }
    // After:  also returns platform name so the frontend chart can
    //         optionally show one line per platform (multi-line chart)
    const result = await pool.query(
      `SELECT pp.price, pp.recorded_at, pl.name AS platform
       FROM product_prices pp
       JOIN platforms pl ON pp.platform_id = pl.id
       WHERE pp.product_id = $1
       ORDER BY pp.recorded_at ASC`,
      [product_id]
    );

    // CHANGE 3: Handle empty result — return 404 instead of empty array
    // Before: returned [] with status 200 — frontend couldn't tell if product exists
    // After:  returns 404 if no history is found yet
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No price history found for this product" });
    }

    // CHANGE 4: Format recorded_at as ISO string consistently
    // Before: Postgres timestamp came back as a JS Date object — inconsistent formatting
    // After:  always a clean ISO string that toLocaleDateString() in the frontend handles correctly
    const rows = result.rows.map(r => ({
      price:       Number(r.price),
      recorded_at: new Date(r.recorded_at).toISOString(),
      platform:    r.platform,
    }));

    res.json(rows);

  } catch (err) {
    console.error(err.message);
    // CHANGE 5: Use next(error) → JSON error response from central handler
    // Before: res.status(500).send("Server Error") — plain text, breaks frontend
    next(err);
  }
});

module.exports = router;