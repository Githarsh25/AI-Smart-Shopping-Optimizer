const cron = require("node-cron");
const pool = require("../db");

cron.schedule("0 * * * *", async () => {
  console.log("Checking price alerts...");

  try {
  
    const alerts = await pool.query(
      "SELECT * FROM alerts WHERE is_active = TRUE"
    );


    if (alerts.rows.length === 0) return;

    const result = await pool.query(`
      SELECT
        a.id         AS alert_id,
        a.product_id,
        a.target_price,
        a.user_id,
        pp.price     AS current_price
      FROM alerts a
      JOIN LATERAL (
        SELECT price
        FROM product_prices
        WHERE product_id = a.product_id
        ORDER BY recorded_at DESC
        LIMIT 1
      ) pp ON true
      WHERE a.is_active = TRUE
      AND pp.price <= a.target_price
    `);

    for (let row of result.rows) {
      console.log(`🔔 ALERT TRIGGERED: Product ${row.product_id} — current ₹${row.current_price}, target ₹${row.target_price}`);

      await pool.query(
        "UPDATE alerts SET is_active = FALSE, triggered_at = NOW() WHERE id = $1",
        [row.alert_id]
      );

    }

  } catch (error) {
    console.error("Price checker error:", error.message);
  }
});

cron.schedule("0 0 * * 0", async () => {
  try {
    await pool.query(
      "DELETE FROM product_prices WHERE recorded_at < NOW() - INTERVAL '90 days'"
    );
    console.log("Old price records cleaned up");
  } catch (error) {
    console.error("Cleanup error:", error.message);
  }
});