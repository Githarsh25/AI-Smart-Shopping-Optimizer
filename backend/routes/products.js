const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const { search } = req.query;

    let result;

    if (search && search.trim().length > 0) {
      // Filtered query — only returns matching products
      result = await pool.query(
        `SELECT id, name, category, created_at
         FROM products
         WHERE LOWER(name) LIKE LOWER($1)
         ORDER BY created_at DESC`,
        [`%${search.trim()}%`]
      );
    } else {
      result = await pool.query(
        `SELECT id, name, category, created_at
         FROM products
         ORDER BY created_at DESC`
      );
    }

    res.json(result.rows);

  } catch (error) {
    console.error(error.message);
    next(error);
  }
});

module.exports = router;