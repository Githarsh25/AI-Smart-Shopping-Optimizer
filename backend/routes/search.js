const express = require("express");
const router = express.Router();
const axios = require("axios");
const pool = require("../db");

if (!process.env.SERP_API_KEY) {
  console.error("FATAL: SERP_API_KEY is not set in .env");
  process.exit(1);
}

router.get("/:query", async (req, res, next) => {
  try {
    const query = req.params.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query cannot be empty" });
    }

   
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine:        "google_shopping",
        q:             query,
        api_key:       process.env.SERP_API_KEY,
        gl:            "in",            // Country: India → prices come in INR
        hl:            "en",            // Language: English
        google_domain: "google.co.in", // Use Google India, not google.com
      },
    });

    const results = response.data.shopping_results;
    if (!results || results.length === 0) return res.json([]);
    
    const productResult = await pool.query(
      `INSERT INTO products (name, category)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [query, "electronics"]
    );
    const product_id = productResult.rows[0].id;


    const cleanedResults = [];

    for (let item of results.slice(0, 5)) {
      if (!item.source) continue;

      const price = item.extracted_price;
      if (!price || typeof price !== "number" || price <= 0) continue;

      const platformName = item.source;

      const platformResult = await pool.query(
        `INSERT INTO platforms (name)
         VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [platformName]
      );
      const platform_id = platformResult.rows[0].id;

      const lastPriceResult = await pool.query(
        `SELECT price FROM product_prices
         WHERE product_id = $1 AND platform_id = $2
         ORDER BY recorded_at DESC LIMIT 1`,
        [product_id, platform_id]
      );
      const lastPrice = lastPriceResult.rows[0]?.price;
      if (!lastPrice || Math.abs(Number(lastPrice) - price) > 0.5) {
        await pool.query(
          "INSERT INTO product_prices (product_id, platform_id, price) VALUES ($1, $2, $3)",
          [product_id, platform_id, price]
        );
      }

      cleanedResults.push({
        title:         item.title,
        price,                                                    
        price_display: item.price || `₹${price.toLocaleString("en-IN")}`, 
        platform:      platformName,
        url:           item.link || null,
        thumbnail:     item.thumbnail || null,
      });
    }

    res.json(cleanedResults);

  } catch (error) {
    console.error(error.response?.data || error.message);
    next(error);
  }
});

module.exports = router;