require("dotenv").config();
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error("❌ CRITICAL: DATABASE_URL environment variable is not defined!");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,                       // Max connections per serverless instance
  idleTimeoutMillis: 10000,     // Close idle connections after 10s
  connectionTimeoutMillis: 10000,// Fail quickly if connection hangs
});

pool.on("error", (err) => {
  console.error("Database pool error:", err.message);
});

module.exports = pool;