const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/optimize", async (req, res, next) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "products must be a non-empty array of product names" });
    }


    const productNames = products.map(n => n.toLowerCase());

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
          WHERE LOWER(pr2.name) = ANY($1::text[])
          ORDER BY pp2.product_id, pp2.platform_id, pp2.recorded_at DESC
        ) pp
        JOIN products pr ON pp.product_id = pr.id
        JOIN platforms pl ON pp.platform_id = pl.id
      ) ranked
      WHERE rn = 1
    `, [productNames]);

    const cart = result.rows.map(row => ({
      product:  row.product_name,
      platform: row.platform,
      price:    Number(row.price),
    }));

    const total_cost = cart.reduce((sum, item) => sum + item.price, 0);

    const foundNames   = cart.map(item => item.product.toLowerCase());
    const not_found    = products.filter(p => !foundNames.includes(p.toLowerCase()));

    res.json({
      cart,
      total_cost,
      not_found: not_found.length > 0 ? not_found : undefined,
    });

  } catch (error) {
    console.error(error.message);
    next(error);
  }
});

module.exports = router;