const express = require("express");
const router = express.Router();
const axios = require("axios");
const pool = require("../db");

router.get("/:query", async (req, res) => {
  try {
    const query = req.params.query;

    // 1. Fetch from API
    const response = await axios.get(
      "https://serpapi.com/search.json",
      {
        params: {
          engine: "google_shopping",
          q: query,
          api_key: process.env.SERP_API_KEY,
        },
      }
    );

    const results = response.data.shopping_results;

    if (!results) return res.json([]);

    // 2. Find or insert product
    let productResult = await pool.query(
      "SELECT * FROM products WHERE name = $1",
      [query]
    );

    let product_id;

    if (productResult.rows.length === 0) {
      const newProduct = await pool.query(
        "INSERT INTO products (name, category) VALUES ($1, $2) RETURNING *",
        [query, "electronics"]
      );
      product_id = newProduct.rows[0].id;
    } else {
      product_id = productResult.rows[0].id;
    }

    // 3. Process results
    const cleanedResults = [];

    for (let item of results.slice(0, 5)) {
      if (!item.price || !item.source) continue;

      // extract number from price string
      const price = parseInt(item.price.replace(/[^\d]/g, ""));

      const platformName = item.source;

      // find or insert platform
      let platformResult = await pool.query(
        "SELECT * FROM platforms WHERE name = $1",
        [platformName]
      );

      let platform_id;

      if (platformResult.rows.length === 0) {
        const newPlatform = await pool.query(
          "INSERT INTO platforms (name) VALUES ($1) RETURNING *",
          [platformName]
        );
        platform_id = newPlatform.rows[0].id;
      } else {
        platform_id = platformResult.rows[0].id;
      }

      // 4. Insert price history
      await pool.query(
        "INSERT INTO product_prices (product_id, platform_id, price) VALUES ($1, $2, $3)",
        [product_id, platform_id, price]
      );

      cleanedResults.push({
        title: item.title,
        price,
        platform: platformName,
      });
    }

    // 5. Return cleaned data
    res.json(cleanedResults);

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send("API Error");
  }
});

module.exports = router;