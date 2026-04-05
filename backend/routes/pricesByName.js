const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /prices-by-name/:name
router.get("/:name", async (req, res, next) => {
  try {
    const name = req.params.name;

    // CHANGE 1: Added input validation
    // Before: no check — empty name caused a LIKE '%' query returning everything
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Search name must be at least 2 characters" });
    }

    // CHANGE 2: Replaced correlated subquery with faster DISTINCT ON
    // Before: for every matched row, ran: SELECT MAX(recorded_at) WHERE product_id AND platform_id
    //   This is the same correlated subquery pattern as prices.js — slow at scale
    // After:  DISTINCT ON gets the latest price per product+platform in one pass
    //
    // CHANGE 3: Added product_name and product_id to the response
    // Before: only returned { platform, price }
    // After:  also returns { product_name, product_id } so the frontend can
    //         immediately use product_id for prediction/history calls
    //         without a separate GET /products lookup
    const result = await pool.query(`
      SELECT pr.name AS product_name, pr.id AS product_id,
             pl.name AS platform, pp.price
      FROM (
        SELECT DISTINCT ON (pp2.product_id, pp2.platform_id)
          pp2.product_id,
          pp2.platform_id,
          pp2.price
        FROM product_prices pp2
        JOIN products pr2 ON pp2.product_id = pr2.id
        WHERE LOWER(pr2.name) LIKE LOWER($1)
        ORDER BY pp2.product_id, pp2.platform_id, pp2.recorded_at DESC
      ) pp
      JOIN products pr ON pp.product_id = pr.id
      JOIN platforms pl ON pp.platform_id = pl.id
      ORDER BY pp.price ASC
    `, [`%${name}%`]);

    // CHANGE 4: Return 404 if no matches at all
    // Before: returned [] with 200 — no way to tell "not found" from "no prices yet"
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No products or prices found matching that name" });
    }

    res.json(result.rows);

  } catch (error) {
    console.error(error.message);
    // CHANGE 5: Use next(error) for JSON error response
    next(error);
  }
});

module.exports = router;