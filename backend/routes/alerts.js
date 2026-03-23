const express = require("express");
const router = express.Router();
const pool = require("../db");

// POST /alerts
router.post("/", async (req, res) => {
  try {
    const { user_id, product_name, target_price } = req.body;

    // find product
    const productResult = await pool.query(
      "SELECT * FROM products WHERE LOWER(name) = LOWER($1)",
      [product_name]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product_id = productResult.rows[0].id;

    // insert alert
    const result = await pool.query(
      "INSERT INTO alerts (user_id, product_id, target_price) VALUES ($1, $2, $3) RETURNING *",
      [user_id, product_id, target_price]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;