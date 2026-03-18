const express = require("express");
const router = express.Router();
const axios = require("axios");
const pool = require("../db");

router.get("/:query", async (req, res) => {
  try {
    const query = req.params.query;

    // 1. Fetch data from SerpAPI
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_shopping",
        q: query,
        api_key: process.env.SERP_API_KEY,
      },
    });

    const results = response.data.shopping_results;

    if (!results) return res.json([]);

    // 2. Check if product exists
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

    const cleanedResults = [];

    // 3. Loop through API results
    for (let item of results.slice(0, 5)) {
      if (!item.price || !item.source) continue;

      // Extract numeric price
      const price = parseInt(item.price.replace(/[^\d]/g, ""));

      const platformName = item.source;

      // 4. Check or insert platform
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

      // 5. Insert price history
      await pool.query(
        "INSERT INTO product_prices (product_id, platform_id, price) VALUES ($1, $2, $3)",
        [product_id, platform_id, price]
      );

      // 6. Prepare response
      cleanedResults.push({
        title: item.title,
        price: price,
        platform: platformName,
      });
    }

    // 7. Send response
    res.json(cleanedResults);

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send("API Error");
  }
});

module.exports = router;