// 🔥 FULL UPDATED VERSION — UI REDESIGN by Claude

import React, { useState } from "react";
import { useEffect, useRef } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

// ─── INJECTED STYLES ──────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #07080d;
    --surface:   #0e1017;
    --surface2:  #141720;
    --border:    rgba(255,255,255,0.06);
    --accent:    #4f8aff;
    --accent2:   #a78bfa;
    --green:     #34d399;
    --red:       #f87171;
    --text:      #e8eaf0;
    --muted:     #5a5f72;
    --font-head: 'Syne', sans-serif;
    --font-mono: 'DM Mono', monospace;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-head); }

  /* ── SCROLLBAR ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--surface2); border-radius: 4px; }

  /* ── ANIMATED BG GRID ── */
  .bg-grid {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(79,138,255,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(79,138,255,0.035) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  /* ── GLOW ORBS ── */
  .orb {
    position: fixed; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0;
  }
  .orb-1 {
    width: 500px; height: 500px; top: -120px; left: -100px;
    background: radial-gradient(circle, rgba(79,138,255,0.12) 0%, transparent 70%);
    animation: driftA 18s ease-in-out infinite alternate;
  }
  .orb-2 {
    width: 400px; height: 400px; bottom: -80px; right: -60px;
    background: radial-gradient(circle, rgba(167,139,250,0.10) 0%, transparent 70%);
    animation: driftB 22s ease-in-out infinite alternate;
  }
  @keyframes driftA { from { transform: translate(0,0) scale(1); } to { transform: translate(60px, 40px) scale(1.1); } }
  @keyframes driftB { from { transform: translate(0,0) scale(1); } to { transform: translate(-50px, -30px) scale(1.08); } }

  /* ── LAYOUT ── */
  .app { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }

  /* ── NAVBAR ── */
  .navbar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0 48px; height: 68px;
    background: rgba(7,8,13,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
  }
  .logo {
    font-size: 18px; font-weight: 800; letter-spacing: -0.5px;
    display: flex; align-items: center; gap: 10px;
  }
  .logo-icon {
    width: 32px; height: 32px; background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-radius: 9px; display: flex; align-items: center; justify-content: center;
    font-size: 16px; box-shadow: 0 0 20px rgba(79,138,255,0.35);
  }
  .logo-sub { font-size: 11px; font-weight: 400; color: var(--muted); font-family: var(--font-mono); letter-spacing: 1px; }

  /* ── CART BUTTON ── */
  .cart-btn {
    position: relative; display: flex; align-items: center; gap: 8px;
    padding: 9px 20px; border-radius: 10px; border: 1px solid var(--border);
    background: var(--surface2); color: var(--text); font-family: var(--font-head);
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: all 0.2s ease;
  }
  .cart-btn:hover { background: var(--surface); border-color: rgba(79,138,255,0.35); box-shadow: 0 0 16px rgba(79,138,255,0.15); }
  .cart-badge {
    position: absolute; top: -7px; right: -7px;
    background: var(--accent); color: #fff; font-size: 10px; font-weight: 700;
    width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono);
  }

  /* ── HERO / SEARCH ── */
  .hero {
    display: flex; flex-direction: column; align-items: center;
    padding: 64px 24px 16px;
    gap: 8px;
  }
  .hero-tag {
    font-family: var(--font-mono); font-size: 11px; color: var(--accent);
    letter-spacing: 2px; text-transform: uppercase;
    padding: 4px 12px; border: 1px solid rgba(79,138,255,0.25);
    border-radius: 999px; background: rgba(79,138,255,0.06);
  }
  .hero-title {
    font-size: clamp(28px, 5vw, 52px); font-weight: 800; text-align: center;
    letter-spacing: -1.5px; line-height: 1.1;
  }
  .hero-title span {
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .hero-sub { color: var(--muted); font-size: 15px; font-weight: 400; text-align: center; margin-top: 4px; }

  /* ── SEARCH BAR ── */
  .search-wrap {
    width: 100%; max-width: 680px; margin: 28px auto 0;
    display: flex; align-items: center;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 14px; overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-wrap:focus-within {
    border-color: rgba(79,138,255,0.4);
    box-shadow: 0 0 0 3px rgba(79,138,255,0.08), 0 0 30px rgba(79,138,255,0.1);
  }
  .search-icon { padding: 0 16px; color: var(--muted); font-size: 17px; flex-shrink: 0; }
  .search-input {
    flex: 1; padding: 16px 0; background: transparent; border: none; outline: none;
    color: var(--text); font-family: var(--font-head); font-size: 15px;
  }
  .search-input::placeholder { color: var(--muted); }
  .search-btn {
    padding: 16px 28px; background: linear-gradient(135deg, var(--accent), #3a70e0);
    border: none; color: #fff; font-family: var(--font-head); font-weight: 700;
    font-size: 14px; cursor: pointer; letter-spacing: 0.5px;
    transition: opacity 0.2s, box-shadow 0.2s; white-space: nowrap;
  }
  .search-btn:hover { opacity: 0.9; box-shadow: 0 0 20px rgba(79,138,255,0.4); }

  /* ── LOADING PULSE ── */
  .loading-bar {
    width: 100%; max-width: 680px; margin: 16px auto 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent), var(--accent2), transparent);
    background-size: 300% 100%;
    animation: shimmer 1.2s linear infinite;
    border-radius: 2px;
  }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* ── SECTION LABEL ── */
  .section-label {
    font-family: var(--font-mono); font-size: 11px; color: var(--muted);
    letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;
    display: flex; align-items: center; gap: 10px;
  }
  .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  /* ── PRODUCTS GRID ── */
  .products-section { width: 100%; max-width: 1100px; margin: 52px auto 0; padding: 0 24px; }
  .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 20px; }

  /* ── PRODUCT CARD ── */
  .product-card {
    position: relative; padding: 24px; border-radius: 16px;
    border: 1px solid var(--border); background: var(--surface);
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    overflow: hidden;
  }
  .product-card::before {
    content: ''; position: absolute; inset: 0; opacity: 0;
    background: radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(79,138,255,0.06), transparent 50%);
    transition: opacity 0.3s;
    pointer-events: none;
  }
  .product-card:hover::before { opacity: 1; }
  .product-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(0,0,0,0.5); border-color: rgba(79,138,255,0.2); }
  .product-card.best-deal { border-color: rgba(52,211,153,0.35); background: rgba(52,211,153,0.04); }
  .product-card.best-deal:hover { box-shadow: 0 20px 48px rgba(52,211,153,0.12); }

  .best-badge {
    position: absolute; top: 16px; right: 16px;
    background: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.3);
    color: var(--green); font-family: var(--font-mono); font-size: 10px;
    padding: 3px 10px; border-radius: 999px; letter-spacing: 1px;
  }

  .product-platform {
    font-family: var(--font-mono); font-size: 11px; color: var(--muted);
    letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px;
  }
  .product-title { font-size: 15px; font-weight: 600; line-height: 1.4; color: var(--text); margin-bottom: 14px; }
  .product-price {
    font-size: 30px; font-weight: 800; letter-spacing: -1px;
    font-family: var(--font-mono);
    background: linear-gradient(90deg, #fff, rgba(255,255,255,0.7));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .product-price-sym { font-size: 18px; font-weight: 400; }

  .add-btn {
    margin-top: 20px; width: 100%; padding: 11px;
    border: 1px solid rgba(79,138,255,0.3); border-radius: 10px;
    background: rgba(79,138,255,0.08); color: var(--accent);
    font-family: var(--font-head); font-weight: 600; font-size: 13px;
    cursor: pointer; letter-spacing: 0.4px;
    transition: all 0.2s ease;
  }
  .add-btn:hover { background: rgba(79,138,255,0.18); box-shadow: 0 0 16px rgba(79,138,255,0.2); }

  /* ── PRICE COMPARISON ── */
  .compare-section { width: 100%; max-width: 1100px; margin: 52px auto 0; padding: 0 24px; }
  .compare-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
  .compare-card {
    padding: 16px 20px; background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; font-family: var(--font-mono);
  }
  .compare-platform { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .compare-price { font-size: 20px; font-weight: 500; color: var(--text); }

  /* ── AI + GRAPH ROW ── */
  .ai-row { width: 100%; max-width: 1100px; margin: 52px auto 0; padding: 0 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media (max-width: 768px) { .ai-row { grid-template-columns: 1fr; } }

  .ai-card {
    padding: 28px; border-radius: 16px; border: 1px solid rgba(79,138,255,0.2);
    background: linear-gradient(135deg, rgba(79,138,255,0.06), rgba(167,139,250,0.04));
  }
  .ai-card-title { font-family: var(--font-mono); font-size: 11px; color: var(--accent); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
  .ai-metric { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .ai-metric:last-of-type { border-bottom: none; }
  .ai-metric-label { font-size: 13px; color: var(--muted); font-family: var(--font-mono); }
  .ai-metric-value { font-size: 20px; font-weight: 700; font-family: var(--font-mono); color: var(--text); }
  .ai-metric-value.up { color: var(--green); }
  .ai-metric-value.down { color: var(--red); }

  .graph-card {
    padding: 28px; border-radius: 16px; border: 1px solid var(--border);
    background: var(--surface);
  }
  .graph-card-title { font-family: var(--font-mono); font-size: 11px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }

  /* ── TREND BUTTON ── */
  .trend-wrap { text-align: center; margin: 32px 0 0; }
  .trend-btn {
    padding: 12px 32px; border-radius: 10px;
    border: 1px solid rgba(167,139,250,0.35);
    background: rgba(167,139,250,0.08); color: var(--accent2);
    font-family: var(--font-head); font-weight: 700; font-size: 14px;
    cursor: pointer; letter-spacing: 0.5px;
    transition: all 0.2s;
  }
  .trend-btn:hover { background: rgba(167,139,250,0.16); box-shadow: 0 0 20px rgba(167,139,250,0.2); }

  /* ── CART SIDEBAR ── */
  .cart-sidebar {
    position: fixed; top: 0; right: 0; height: 100%;
    width: 340px; background: var(--surface);
    border-left: 1px solid var(--border);
    z-index: 200; display: flex; flex-direction: column;
    box-shadow: -20px 0 60px rgba(0,0,0,0.5);
  }
  .cart-header {
    padding: 24px; border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
  }
  .cart-title { font-size: 16px; font-weight: 700; }
  .cart-close {
    width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--border);
    background: transparent; color: var(--muted); font-size: 16px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .cart-close:hover { background: var(--surface2); color: var(--text); }
  .cart-body { flex: 1; overflow-y: auto; padding: 16px 24px; }
  .cart-empty { color: var(--muted); font-family: var(--font-mono); font-size: 13px; margin-top: 20px; }
  .cart-item {
    padding: 14px; border-radius: 12px; border: 1px solid var(--border);
    background: var(--surface2); margin-bottom: 10px;
  }
  .cart-item-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
  .cart-item-price { font-family: var(--font-mono); font-size: 15px; color: var(--accent); }
  .cart-remove { background: none; border: none; color: var(--muted); font-size: 12px; cursor: pointer; margin-top: 6px; font-family: var(--font-mono); transition: color 0.2s; }
  .cart-remove:hover { color: var(--red); }
  .cart-footer {
    padding: 20px 24px; border-top: 1px solid var(--border);
  }
  .cart-total {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 16px;
  }
  .cart-total-label { font-size: 13px; color: var(--muted); font-family: var(--font-mono); }
  .cart-total-value { font-family: var(--font-mono); font-size: 22px; font-weight: 700; color: var(--text); }
  .checkout-btn {
    width: 100%; padding: 14px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #fff; font-family: var(--font-head); font-weight: 700; font-size: 14px;
    cursor: pointer; transition: opacity 0.2s, box-shadow 0.2s;
  }
  .checkout-btn:hover { opacity: 0.9; box-shadow: 0 0 24px rgba(79,138,255,0.4); }

  /* ── FOOTER ── */
  .footer {
    margin-top: 80px; padding: 28px; text-align: center;
    border-top: 1px solid var(--border);
  }
  .footer-name { font-weight: 700; font-size: 14px; }
  .footer-sub { font-family: var(--font-mono); font-size: 11px; color: var(--muted); margin-top: 4px; letter-spacing: 1px; }
`;

// ─── CHART OPTIONS ─────────────────────────────────────────────────────────────
const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: { color: "#5a5f72", font: { family: "'DM Mono', monospace", size: 10 } }
    },
    y: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: { color: "#5a5f72", font: { family: "'DM Mono', monospace", size: 10 } }
    }
  }
};

// ─── APP ───────────────────────────────────────────────────────────────────────
function App() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const cartRef = useRef();

  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price), 0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setShowCart(false);
      }
    };
    if (showCart) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCart]);

  const addToCart = (product) => setCart(prev => [...prev, product]);

  const removeFromCart = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const searchProduct = async () => {
    try {
      setLoading(true);
      setProducts([]);
      setPrices([]);
      setPrediction(null);
      setHistory([]);
      setShowGraph(false);

      const res = await axios.get(`http://localhost:5000/search/${encodeURIComponent(query)}`);
      setProducts(res.data);

      const priceRes = await axios.get(`http://localhost:5000/prices-by-name/${encodeURIComponent(query)}`);
      setPrices(priceRes.data);

      const productRes = await axios.get("http://localhost:5000/products");
      const product = productRes.data.find(p => p.name.toLowerCase().includes(query.toLowerCase()));

      if (product) {
        const predRes = await axios.get(`http://localhost:5000/price-prediction/${product.id}`);
        setPrediction(predRes.data);

        const historyRes = await axios.get(`http://localhost:5000/price-history/${product.id}`);
        setHistory(historyRes.data);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const chartData = {
    labels: history.map(h => new Date(h.recorded_at).toLocaleDateString()),
    datasets: [{
      label: "Price",
      data: history.map(h => h.price),
      borderColor: "#4f8aff",
      backgroundColor: "rgba(79,138,255,0.06)",
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: "#4f8aff"
    }]
  };

  const minPrice = products.length ? Math.min(...products.map(x => x.price)) : null;
  const priceDir = prediction
    ? prediction.predicted_price >= prediction.current_price ? "up" : "down"
    : null;

  return (
    <>
      <style>{styles}</style>

      <div className="bg-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="app">

        {/* ── NAVBAR ── */}
        <nav className="navbar">
          <div className="logo">
            <div className="logo-icon">🛒</div>
            <div>
              Smart Shopping
              <div className="logo-sub">AI POWERED</div>
            </div>
          </div>

          <button className="cart-btn" onClick={() => setShowCart(!showCart)}>
            🛒 Cart
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </button>
        </nav>

        {/* ── HERO ── */}
        <div className="hero">
          <div className="hero-tag">price intelligence engine</div>
          <h1 className="hero-title">
            Find the best deal,<br /><span>powered by AI</span>
          </h1>
          <p className="hero-sub">Compare prices across platforms. Predict tomorrow's price today.</p>

          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              placeholder="Search for any product…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchProduct()}
            />
            <button className="search-btn" onClick={searchProduct}>Search</button>
          </div>

          {loading && <div className="loading-bar" />}
        </div>

        {/* ── PRODUCTS ── */}
        {products.length > 0 && (
          <div className="products-section">
            <div className="section-label">Results · {products.length} found</div>
            <div className="products-grid">
              {products.map((p, i) => (
                <div key={i} className={`product-card ${p.price === minPrice ? "best-deal" : ""}`}>
                  {p.price === minPrice && <span className="best-badge">BEST DEAL</span>}
                  <div className="product-platform">{p.platform}</div>
                  <div className="product-title">{p.title}</div>
                  <div className="product-price">
                    <span className="product-price-sym">₹</span>{Number(p.price).toLocaleString("en-IN")}
                  </div>
                  <button className="add-btn" onClick={() => addToCart(p)}>+ Add to Cart</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRICE COMPARISON ── */}
        {prices.length > 0 && (
          <div className="compare-section">
            <div className="section-label">Price Comparison</div>
            <div className="compare-grid">
              {prices.map((p, i) => (
                <div key={i} className="compare-card">
                  <div className="compare-platform">{p.platform}</div>
                  <div className="compare-price">₹{Number(p.price).toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AI PREDICTION + GRAPH ── */}
        {(prediction || showGraph) && (
          <div className="ai-row">
            {prediction && (
              <div className="ai-card">
                <div className="ai-card-title">🤖 AI Price Prediction</div>
                <div className="ai-metric">
                  <span className="ai-metric-label">Current Price</span>
                  <span className="ai-metric-value">₹{Number(prediction.current_price).toLocaleString("en-IN")}</span>
                </div>
                <div className="ai-metric">
                  <span className="ai-metric-label">Predicted Next</span>
                  <span className={`ai-metric-value ${priceDir}`}>
                    ₹{Number(prediction.predicted_price).toLocaleString("en-IN")}
                    {priceDir === "up" ? " ↑" : " ↓"}
                  </span>
                </div>
              </div>
            )}
            {showGraph && (
              <div className="graph-card">
                <div className="graph-card-title">📈 Price History</div>
                <Line data={chartData} options={chartOptions} />
              </div>
            )}
          </div>
        )}

        {/* ── TREND BUTTON ── */}
        {history.length > 0 && (
          <div className="trend-wrap">
            <button className="trend-btn" onClick={() => setShowGraph(!showGraph)}>
              {showGraph ? "Hide" : "Show"} Trend Analysis
            </button>
          </div>
        )}

        {/* ── CART SIDEBAR ── */}
        {showCart && (
          <div className="cart-sidebar" ref={cartRef}>
            <div className="cart-header">
              <span className="cart-title">Your Cart · {cart.length}</span>
              <button className="cart-close" onClick={() => setShowCart(false)}>✕</button>
            </div>

            <div className="cart-body">
              {cart.length === 0 ? (
                <div className="cart-empty">No items yet.</div>
              ) : (
                cart.map((item, i) => (
                  <div key={i} className="cart-item">
                    <div className="cart-item-title">{item.title}</div>
                    <div className="cart-item-price">₹{Number(item.price).toLocaleString("en-IN")}</div>
                    <button className="cart-remove" onClick={() => removeFromCart(i)}>✕ Remove</button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span className="cart-total-label">Total</span>
                  <span className="cart-total-value">₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
                <button className="checkout-btn">Proceed to Checkout →</button>
              </div>
            )}
          </div>
        )}

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div className="footer-name">Harsh Rana 🚀</div>
          <div className="footer-sub">AI SMART SHOPPING PLATFORM</div>
        </footer>

      </div>
    </>
  );
}

export default App;