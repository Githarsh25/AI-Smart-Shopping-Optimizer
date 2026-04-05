const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /products
// CHANGE 1: Added optional ?search= query param so you can filter products
// Before: always returned ALL products — App.jsx then did .find() in JavaScript
//   The frontend was fetching all products just to find one matching the search query
//   As your DB grows (hundreds of products), this wastes bandwidth
// After:  if ?search=iphone is provided, filters in SQL instead
//   App.jsx can call: GET /products?search=iphone
//   instead of: GET /products (all) then filter in JS
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
      // CHANGE 2: Don't use SELECT * — only return the columns you actually need
      // Before: SELECT * FROM products (returns all columns including internal ones)
      // After:  SELECT id, name, category, created_at (explicit, safer)
      result = await pool.query(
        `SELECT id, name, category, created_at
         FROM products
         ORDER BY created_at DESC`
      );
    }

    res.json(result.rows);

  } catch (error) {
    console.error(error.message);
    // CHANGE 3: Use next(error) → central handler returns JSON
    // Before: res.status(500).send("Server Error") — plain text
    next(error);
  }
});

module.exports = router;