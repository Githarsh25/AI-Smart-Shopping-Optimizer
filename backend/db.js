require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
  } else {
    console.log("✅ Connected to Neon PostgreSQL");
    release();
  }
});

pool.on("error", (err) => {
  console.error("Database pool error:", err.message);
});

module.exports = pool;