const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/:name", async (req, res, next) => {
  try {
    const name = req.params.name;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Search name must be at least 2 characters" });
    }

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


    if (result.rows.length === 0) {
      return res.json([]);
    }

    res.json(result.rows);

  } catch (error) {
    console.error(error.message);
    next(error);
  }
});

module.exports = router;