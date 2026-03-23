const cron = require("node-cron");
const pool = require("../db");

cron.schedule("* * * * *", async () => {
  console.log("Checking price alerts...");

  try {
    const alerts = await pool.query("SELECT * FROM alerts");

    for (let alert of alerts.rows) {

      const priceResult = await pool.query(`
        SELECT pp.price
        FROM product_prices pp
        WHERE product_id = $1
        ORDER BY recorded_at DESC
        LIMIT 1
      `, [alert.product_id]);

      if (priceResult.rows.length === 0) continue;

      const current_price = Number(priceResult.rows[0].price);

      if (current_price <= alert.target_price) {
        console.log(`🔔 ALERT: Product ${alert.product_id} reached target price ${alert.target_price}`);
      }
    }

  } catch (error) {
    console.error(error.message);
  }
});