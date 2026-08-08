require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const searchRoutes       = require("./routes/search");
const priceRoutes        = require("./routes/prices");
const productRoutes      = require("./routes/products");
const bestPriceRoutes    = require("./routes/bestPrice");
const predictionRoutes   = require("./routes/prediction");
const dealRoutes         = require("./routes/deals");
const cartRoutes         = require("./routes/cart");
const alertRoutes        = require("./routes/alerts");
const priceByNameRoutes  = require("./routes/pricesByName");
const priceHistoryRoutes = require("./routes/priceHistory");

const aiAdvisorRoutes   = require("./routes/aiAdvisor");    // LLM shopping advisor
const aiChatRoutes      = require("./routes/aiChat");        // RAG pipeline chat
const aiCartAgentRoutes = require("./routes/aiCartAgent");   // Multi-agent cart optimizer

const app = express();

// Cron jobs only run in traditional server mode, not on Vercel serverless
if (!process.env.VERCEL) {
  require("./cron/priceChecker");
}

const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(",").map(o => o.trim())
  : "*";

app.use(cors({
  origin: allowedOrigins
}));
app.use(express.json());

app.use("/search",         searchRoutes);
app.use("/prices",         priceRoutes);
app.use("/products",       productRoutes);
app.use("/best-price",     bestPriceRoutes);
app.use("/price-prediction", predictionRoutes);
app.use("/deals",          dealRoutes);
app.use("/cart",           cartRoutes);
app.use("/alerts",         alertRoutes);
app.use("/prices-by-name", priceByNameRoutes);
app.use("/price-history",  priceHistoryRoutes);

app.use("/ai/advisor",    aiAdvisorRoutes);    // POST /ai/advisor
app.use("/ai/chat",       aiChatRoutes);        // POST /ai/chat
app.use("/ai/cart-agent", aiCartAgentRoutes);   // POST /ai/cart-agent

app.get("/", (req, res) => {
  res.send("Smart Shopping AI Backend Running");
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: "Internal server error" });
});

// Only start listener locally — Vercel handles this automatically
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
