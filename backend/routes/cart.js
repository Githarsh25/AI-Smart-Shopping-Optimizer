const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/optimize", async (req, res, next) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "products must be a non-empty array of product names" });
    }

    const searchTerms = [];

    products.forEach((p) => {
      if (typeof p === "string") {
        searchTerms.push(p.toLowerCase());
        p.toLowerCase().split(/\s+/).forEach((w) => {
          if (w.length > 3) searchTerms.push(w);
        });
      } else if (p && typeof p === "object") {
        if (p.query) searchTerms.push(p.query.toLowerCase());
        if (p.title) {
          searchTerms.push(p.title.toLowerCase());
          p.title.toLowerCase().split(/\s+/).forEach((w) => {
            if (w.length > 3) searchTerms.push(w);
          });
        }
      }
    });

    const uniqueTerms = [...new Set(searchTerms.filter(Boolean))].slice(0, 20);

    if (uniqueTerms.length === 0) {
      return res.json({ cart: [], total_cost: 0 });
    }

    const conditions = uniqueTerms
      .map((_, i) => `LOWER(pr2.name) LIKE $${i + 1} OR $${i + 1} LIKE '%' || LOWER(pr2.name) || '%'`)
      .join(" OR ");

    const result = await pool.query(`
      SELECT product_name, platform, price
      FROM (
        SELECT
          pr.name AS product_name,
          pl.name AS platform,
          pp.price,
          ROW_NUMBER() OVER (
            PARTITION BY pr.id
            ORDER BY pp.price ASC
          ) AS rn
        FROM (
          SELECT DISTINCT ON (pp2.product_id, pp2.platform_id)
            pp2.product_id,
            pp2.platform_id,
            pp2.price
          FROM product_prices pp2
          JOIN products pr2 ON pp2.product_id = pr2.id
          WHERE ${conditions}
          ORDER BY pp2.product_id, pp2.platform_id, pp2.recorded_at DESC
        ) pp
        JOIN products pr ON pp.product_id = pr.id
        JOIN platforms pl ON pp.platform_id = pl.id
      ) ranked
      WHERE rn = 1
    `, uniqueTerms.map((k) => `%${k}%`));

    const cart = result.rows.map((row) => ({
      product:  row.product_name,
      platform: row.platform,
      price:    Number(row.price),
    }));

    const total_cost = cart.reduce((sum, item) => sum + item.price, 0);

    res.json({
      cart,
      total_cost,
    });

  } catch (error) {
    console.error("Cart optimization error:", error.message);
    next(error);
  }
});

module.exports = router;
