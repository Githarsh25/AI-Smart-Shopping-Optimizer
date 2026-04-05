require("dotenv").config();
const { Pool } = require("pg");

// Print exactly which values are being used — helps diagnose .env mistakes
console.log("Connecting to PostgreSQL with:");
console.log("  host    :", process.env.DB_HOST);
console.log("  port    :", process.env.DB_PORT || 5432);
console.log("  database:", process.env.DB_NAME);
console.log("  user    :", process.env.DB_USER);
console.log("  password:", process.env.DB_PASSWORD ? "****" : "⚠ NOT SET");

const pool = new Pool({
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port:     Number(process.env.DB_PORT) || 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("\n❌ PostgreSQL connection failed!");
    console.error("   Error code   :", err.code);
    console.error("   Error message:", err.message);
    console.error("\n   Common causes:");
    console.error("   - Wrong DB_PASSWORD in your .env file");
    console.error("   - Wrong DB_NAME — check exact name in pgAdmin");
    console.error("   - PostgreSQL service is not running");
    console.error("   - DB_HOST should be 'localhost' for local installs\n");
  } else {
    console.log("✅ Connected to PostgreSQL successfully");
    release();
  }
});

pool.on("error", (err) => {
  console.error("Database pool error:", err.message);
});

module.exports = pool;