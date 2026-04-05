const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res, next) => {
  try {
    const { user_id, product_name, target_price } = req.body;

    if (!user_id || !product_name || target_price === undefined) {
      return res.status(400).json({ message: "user_id, product_name, and target_price are required" });
    }
    if (isNaN(target_price) || Number(target_price) <= 0) {
      return res.status(400).json({ message: "target_price must be a positive number" });
    }

    const productResult = await pool.query(
      "SELECT * FROM products WHERE LOWER(name) = LOWER($1)",
      [product_name]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found. Search for it first." });
    }

    const product_id = productResult.rows[0].id;

    const existing = await pool.query(
      "SELECT * FROM alerts WHERE user_id=$1 AND product_id=$2 AND is_active=TRUE",
      [user_id, product_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: "An active alert already exists for this product",
        alert: existing.rows[0]
      });
    }

    
    const result = await pool.query(
      "INSERT INTO alerts (user_id, product_id, target_price, is_active) VALUES ($1, $2, $3, TRUE) RETURNING *",
      [user_id, product_id, target_price]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error.message);
    next(error);
  }
});

router.get("/:user_id", async (req, res, next) => {
  try {
    const { user_id } = req.params;
    if (isNaN(user_id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const result = await pool.query(
      `SELECT a.*, p.name AS product_name
       FROM alerts a
       JOIN products p ON a.product_id = p.id
       WHERE a.user_id = $1 AND a.is_active = TRUE
       ORDER BY a.created_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;