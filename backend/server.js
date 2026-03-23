require("dotenv").config();
const express = require("express");
const cors = require("cors");
const searchRoutes = require("./routes/search");
const priceRoutes = require("./routes/prices");
const productRoutes = require("./routes/products");
const bestPriceRoutes = require("./routes/bestprice");
const predictionRoutes = require("./routes/prediction");
const dealRoutes = require("./routes/deals");
const cartRoutes = require("./routes/cart");
const alertRoutes = require("./routes/alerts");
const app = express();
require("./cron/priceChecker");

app.use(cors());
app.use(express.json());
app.use("/search", searchRoutes);
app.use("/prices", priceRoutes);
app.use("/products", productRoutes);
app.use("/best-price", bestPriceRoutes);
app.use("/price-prediction", predictionRoutes);
app.use("/deals", dealRoutes);
app.use("/cart", cartRoutes);
app.use("/alerts", alertRoutes);

app.get("/", (req, res) => {
  res.send("Smart Shopping AI Backend Running");
});

console.log("searchRoutes:", searchRoutes);


const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});