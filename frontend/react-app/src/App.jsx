import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
);

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f1f3f6; --surface: #ffffff; --surface2: #f5f5f5;
    --border: #e0e0e0; --accent: #2874f0; --accent2: #ff9f00;
    --green: #388e3c; --red: #d32f2f; --amber: #f57c00;
    --text: #212121; --muted: #878787;
    --font-head: 'Inter', 'Roboto', sans-serif; --font-mono: 'Inter', 'Roboto', sans-serif;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-head); font-size: 14px; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
  ::-webkit-scrollbar-track { background: #f1f1f1; }
  .app { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }

  /* NAVBAR */
  .navbar { display: flex; justify-content: space-between; align-items: center; padding: 0 32px; height: 56px;
    background: #2874f0; position: sticky; top: 0; z-index: 100; gap: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  .logo { font-size: 20px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 10px; }
  .logo-icon { font-size: 22px; }
  .logo-sub { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.85); letter-spacing: 0.5px; }
  .nav-right { display: flex; gap: 10px; align-items: center; }
  .chat-nav-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 4px;
    border: 1px solid rgba(255,255,255,0.6); background: transparent; color: #fff;
    font-family: var(--font-head); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .chat-nav-btn:hover { background: rgba(255,255,255,0.1); }
  .chat-nav-btn.active { background: rgba(255,255,255,0.2); border-color: #fff; }
  .cart-btn { position: relative; display: flex; align-items: center; gap: 8px; padding: 8px 18px;
    border-radius: 4px; border: none; background: #ff9f00;
    color: #212121; font-family: var(--font-head); font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.2s ease; }
  .cart-btn:hover { background: #f5971a; }
  .cart-badge { position: absolute; top: -6px; right: -6px; background: #d32f2f; color: #fff;
    font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; }

  /* HERO */
  .hero { display: flex; flex-direction: column; align-items: center; padding: 48px 24px 16px; gap: 8px;
    background: #fff; border-bottom: 1px solid var(--border); }
  .hero-title { font-size: 32px; font-weight: 700; text-align: center; letter-spacing: -0.5px;
    line-height: 1.2; color: var(--text); }
  .hero-title span { color: var(--accent); }
  .hero-sub { color: var(--muted); font-size: 15px; text-align: center; margin-top: 4px; }
  .search-wrap { width: 100%; max-width: 600px; margin: 24px auto 0; display: flex; align-items: center;
    background: #fff; border: 2px solid var(--border); border-radius: 4px; overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s; height: 48px; }
  .search-wrap:focus-within { border-color: #2874f0; box-shadow: 0 0 0 3px rgba(40,116,240,0.1); }
  .search-icon { padding: 0 14px; color: var(--muted); font-size: 17px; flex-shrink: 0; }
  .search-input { flex: 1; padding: 12px 0; background: transparent; border: none; outline: none;
    color: var(--text); font-family: var(--font-head); font-size: 15px; }
  .search-input::placeholder { color: #b0b0b0; }
  .search-btn { padding: 0 28px; height: 100%; background: #2874f0;
    border: none; color: #fff; font-family: var(--font-head); font-weight: 600; font-size: 14px;
    cursor: pointer; transition: background 0.2s; white-space: nowrap; }
  .search-btn:hover { background: #1a5dc8; }
  .loading-text { width: 100%; max-width: 600px; margin: 14px auto 0; text-align: center;
    color: var(--accent); font-size: 14px; font-weight: 500; }
  .error-msg { width: 100%; max-width: 600px; margin: 12px auto 0; padding: 10px 16px; border-radius: 4px;
    background: #fde8e8; border: 1px solid #f5c6c6;
    color: var(--red); font-size: 14px; text-align: center; }

  .section-label { font-size: 12px; color: var(--muted); letter-spacing: 1px;
    text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; font-weight: 500; }
  .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  /* PRODUCT CARDS */
  .products-section { width: 100%; max-width: 1100px; margin: 32px auto 0; padding: 0 24px; }
  .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .product-card { position: relative; padding: 20px; border-radius: 4px; border: 1px solid var(--border);
    background: #fff; transition: transform 0.2s, box-shadow 0.2s; overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .product-card:hover { transform: translateY(-3px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
  .product-card.best-deal { border-color: #388e3c; }
  .best-badge { position: absolute; top: 0; left: 0; background: #388e3c;
    color: #fff; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 0 0 4px 0; letter-spacing: 0.5px; }
  .product-platform { font-size: 12px; color: var(--accent); letter-spacing: 1px;
    text-transform: uppercase; margin-bottom: 8px; font-weight: 500; }
  .product-title { font-size: 14px; font-weight: 500; line-height: 1.4; color: var(--text); margin-bottom: 12px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .product-price { font-size: 24px; font-weight: 700; color: var(--text); }
  .savings-badge { font-size: 13px; color: var(--green); margin-top: 6px; font-weight: 500; }
  .add-btn { margin-top: 16px; width: 100%; padding: 10px; border: none;
    border-radius: 2px; background: #ff9f00; color: #212121;
    font-family: var(--font-head); font-weight: 700; font-size: 14px; cursor: pointer;
    transition: background 0.2s; height: 40px; }
  .add-btn:hover { background: #f5971a; }
  .buy-link { display: block; margin-top: 8px; text-align: center;
    font-size: 12px; color: var(--accent); text-decoration: none; transition: color 0.2s; }
  .buy-link:hover { color: #1a5dc8; text-decoration: underline; }

  /* COMPARE */
  .compare-section { width: 100%; max-width: 1100px; margin: 32px auto 0; padding: 0 24px; }
  .compare-grid { display: grid; grid-template-columns: 1fr; gap: 0; background: #fff; border: 1px solid var(--border);
    border-left: 4px solid #2874f0; border-radius: 4px; overflow: hidden; }
  .compare-card { padding: 14px 20px; display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid #f0f0f0; background: #fff; }
  .compare-card:last-child { border-bottom: none; }
  .compare-card.cheapest { background: #e8f0fe; }
  .compare-platform { font-size: 13px; color: var(--text); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; }
  .compare-price { font-size: 18px; font-weight: 700; color: var(--text); }

  /* AI ROW */
  .ai-row { width: 100%; max-width: 1100px; margin: 32px auto 0; padding: 0 24px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 768px) { .ai-row { grid-template-columns: 1fr; } }
  .ai-card { padding: 24px; border-radius: 4px; border: 1px solid var(--border);
    background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .ai-card-title { font-size: 14px; color: var(--accent); letter-spacing: 0.5px;
    text-transform: uppercase; margin-bottom: 16px; font-weight: 600; }
  .ai-metric { display: flex; justify-content: space-between; align-items: center;
    padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
  .ai-metric:last-of-type { border-bottom: none; }
  .ai-metric-label { font-size: 13px; color: var(--muted); }
  .ai-metric-value { font-size: 18px; font-weight: 700; color: var(--text); }
  .ai-metric-value.up { color: var(--green); }
  .ai-metric-value.down { color: var(--red); }
  .prediction-reason { font-size: 13px; color: var(--muted); margin-top: 12px; padding-top: 12px;
    border-top: 1px solid #f0f0f0; line-height: 1.6; }
  .confidence-badge { display: inline-block; font-size: 11px; letter-spacing: 0.5px;
    padding: 3px 10px; border-radius: 4px; margin-top: 10px; font-weight: 500; }
  .confidence-high   { background: #e8f5e9; color: var(--green); }
  .confidence-medium { background: #fff3e0; color: var(--amber); }
  .confidence-low    { background: #fde8e8; color: var(--red); }
  .alert-form { margin-top: 14px; padding-top: 14px; border-top: 1px solid #f0f0f0; display: flex; gap: 8px; }
  .alert-input { flex: 1; padding: 9px 12px; background: #fff; border: 1px solid var(--border);
    border-radius: 4px; color: var(--text); font-family: var(--font-head); font-size: 13px; outline: none; }
  .alert-input:focus { border-color: #2874f0; }
  .alert-btn { padding: 9px 16px; border-radius: 4px; border: none;
    background: #2874f0; color: #fff; font-family: var(--font-head);
    font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background 0.2s; }
  .alert-btn:hover { background: #1a5dc8; }
  .alert-success { font-size: 13px; color: var(--green); margin-top: 8px; font-weight: 500; }
  .graph-card { padding: 24px; border-radius: 4px; border: 1px solid var(--border);
    background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .graph-card-title { font-size: 14px; color: var(--muted); letter-spacing: 0.5px;
    text-transform: uppercase; margin-bottom: 16px; font-weight: 600; }
  .trend-wrap { text-align: center; margin: 24px 0 0; }
  .trend-btn { padding: 10px 28px; border-radius: 4px; border: 1px solid #2874f0;
    background: transparent; color: #2874f0; font-family: var(--font-head);
    font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; }
  .trend-btn:hover { background: #e8f0fe; }

  /* AI ADVISOR CARD */
  .advisor-section { width: 100%; max-width: 1100px; margin: 24px auto 0; padding: 0 24px; }
  .advisor-card { padding: 24px; border-radius: 4px; border: 1px solid var(--border);
    border-top: 3px solid #2874f0; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .advisor-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
  .advisor-title { font-size: 14px; color: var(--accent); letter-spacing: 0.5px;
    text-transform: uppercase; font-weight: 600; }
  .advisor-loading { font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 8px; }
  .pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: pulse 1s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .verdict-badge { font-size: 13px; font-weight: 600; padding: 5px 16px; border-radius: 4px; }
  .verdict-buy  { background: #e8f5e9; color: var(--green); }
  .verdict-wait { background: #fff3e0; color: var(--amber); }
  .verdict-deal { background: #e8f0fe; color: var(--accent); }
  .risk-badge { font-size: 11px; padding: 3px 10px; border-radius: 4px; font-weight: 500; }
  .risk-Low    { background: #e8f5e9; color: var(--green); }
  .risk-Medium { background: #fff3e0; color: var(--amber); }
  .risk-High   { background: #fde8e8; color: var(--red); }
  .advisor-summary { font-size: 15px; color: var(--text); line-height: 1.7; margin-bottom: 14px; }
  .advisor-insight { font-size: 13px; color: var(--text); line-height: 1.6;
    padding: 12px 16px; background: #e8f0fe; border-radius: 4px; border-left: 3px solid var(--accent); }
  .advisor-meta { font-size: 11px; color: var(--muted); margin-top: 12px; letter-spacing: 0.5px; }

  /* RAG CHAT */
  .chat-panel { position: fixed; bottom: 0; right: 24px; width: 380px; z-index: 150;
    background: #fff; border: 1px solid var(--border); border-bottom: none;
    border-radius: 4px 4px 0 0; box-shadow: 0 -4px 24px rgba(0,0,0,0.12);
    display: flex; flex-direction: column; max-height: 520px; }
  .chat-header { padding: 14px 20px; border-bottom: 1px solid var(--border);
    background: #2874f0; border-radius: 4px 4px 0 0;
    display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
  .chat-header-left { display: flex; align-items: center; gap: 8px; }
  .chat-header-title { font-size: 14px; font-weight: 700; color: #fff; }
  .chat-header-sub { font-size: 11px; color: rgba(255,255,255,0.75); }
  .rag-badge { font-size: 10px; letter-spacing: 0.5px; padding: 2px 7px;
    border-radius: 4px; background: rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); }
  .chat-close-btn { width: 28px; height: 28px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3);
    background: transparent; color: #fff; cursor: pointer; display: flex;
    align-items: center; justify-content: center; font-size: 14px; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .chat-msg { max-width: 88%; padding: 10px 14px; border-radius: 4px; font-size: 13px; line-height: 1.6; }
  .chat-msg.user { background: #2874f0; color: #fff; align-self: flex-end; }
  .chat-msg.assistant { background: #f5f5f5; color: var(--text); align-self: flex-start; }
  .chat-msg.assistant .rag-context { font-size: 11px; color: var(--green); margin-top: 6px; }
  .chat-msg.thinking { background: #f5f5f5; color: var(--muted); align-self: flex-start;
    font-size: 12px; display: flex; align-items: center; gap: 8px; }
  .chat-empty { font-size: 13px; color: var(--muted); text-align: center; padding: 20px 0; line-height: 1.8; }
  .chat-input-row { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; flex-shrink: 0; }
  .chat-input { flex: 1; padding: 10px 12px; background: #fff; border: 1px solid var(--border);
    border-radius: 4px; color: var(--text); font-family: var(--font-head); font-size: 13px; outline: none; }
  .chat-input:focus { border-color: #2874f0; }
  .chat-send-btn { padding: 10px 16px; border-radius: 4px; border: none;
    background: #2874f0; color: #fff;
    font-family: var(--font-head); font-weight: 600; font-size: 13px; cursor: pointer; white-space: nowrap; }
  .chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* CART */
  .cart-sidebar { position: fixed; top: 0; right: 0; height: 100%; width: 360px; background: #fff;
    border-left: 1px solid var(--border); z-index: 200; display: flex; flex-direction: column;
    box-shadow: -4px 0 24px rgba(0,0,0,0.1); }
  .cart-header { padding: 0 20px; height: 56px; border-bottom: 1px solid var(--border); display: flex;
    justify-content: space-between; align-items: center; background: #2874f0; }
  .cart-title { font-size: 15px; font-weight: 700; color: #fff; }
  .cart-close { width: 28px; height: 28px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3);
    background: transparent; color: #fff; font-size: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; }
  .cart-body { flex: 1; overflow-y: auto; padding: 16px 20px; background: var(--bg); }
  .cart-empty { color: var(--muted); font-size: 13px; margin-top: 20px; }
  .cart-item { padding: 14px; border-radius: 4px; border: 1px solid var(--border);
    background: #fff; margin-bottom: 10px; }
  .cart-item-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--text); }
  .cart-item-price { font-size: 15px; color: var(--accent); font-weight: 700; }
  .cart-remove { background: none; border: none; color: var(--red); font-size: 12px;
    cursor: pointer; margin-top: 6px; }
  .cart-remove:hover { text-decoration: underline; }
  .cart-footer { padding: 16px 20px; border-top: 1px solid var(--border); background: #fff; }
  .cart-total { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .cart-total-label { font-size: 14px; color: var(--muted); }
  .cart-total-value { font-size: 22px; font-weight: 700; color: var(--text); }
  .optimize-btn { width: 100%; padding: 10px; border-radius: 4px; margin-bottom: 4px;
    border: none; background: #2874f0; color: #fff;
    font-family: var(--font-head); font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; }
  .optimize-btn:hover:not(:disabled) { background: #1a5dc8; }
  .optimize-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .optimize-btn-outlined { width: 100%; padding: 10px; border-radius: 4px; margin-bottom: 4px;
    border: 1px solid #2874f0; background: #fff; color: #2874f0;
    font-family: var(--font-head); font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; }
  .optimize-btn-outlined:hover:not(:disabled) { background: #e8f0fe; }
  .optimize-btn-outlined:disabled { opacity: 0.5; cursor: not-allowed; }
  .optimize-subtitle { font-size: 11px; color: var(--muted); margin-bottom: 8px; text-align: center; }
  .optimized-total { font-size: 13px; color: var(--green); margin-bottom: 10px; font-weight: 500; }
  .optimized-items { margin-bottom: 10px; }
  .optimized-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px;
    background: #e8f0fe; border-radius: 4px; margin-bottom: 4px; font-size: 12px; }
  .optimized-item-name { color: var(--text); font-weight: 500; flex: 1; margin-right: 8px; }
  .optimized-item-detail { color: var(--accent); font-weight: 600; white-space: nowrap; }
  .optimize-warning { font-size: 12px; color: var(--amber); margin-bottom: 10px; padding: 8px 12px;
    background: #fff3e0; border-radius: 4px; border-left: 3px solid var(--amber); line-height: 1.5; }

  /* AI Cart Agent result */
  .agent-strategy { margin: 10px 0; padding: 14px 16px; border-radius: 4px;
    background: #e8f0fe; border-left: 3px solid #2874f0;
    font-size: 13px; color: var(--text); line-height: 1.65; }
  .agent-label { font-size: 11px; color: var(--accent);
    letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; font-weight: 600; }
  .agent-pipeline-badge { font-size: 11px; color: var(--muted); margin-top: 10px; letter-spacing: 0.5px; }

  .checkout-btn { width: 100%; padding: 14px; border-radius: 4px; border: none;
    background: #ff9f00; color: #212121;
    font-family: var(--font-head); font-weight: 700; font-size: 14px; cursor: pointer; margin-top: 8px;
    transition: background 0.2s; }
  .checkout-btn:hover { background: #f5971a; }

  .footer { margin-top: 60px; padding: 24px; text-align: center; background: #fff;
    border-top: 1px solid var(--border); }
  .footer-name { font-weight: 700; font-size: 14px; color: var(--text); }
  .footer-sub { font-size: 12px; color: var(--muted); margin-top: 4px; letter-spacing: 0.5px; }
`;

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  scales: {
    x: {
      grid: { color: "rgba(0,0,0,0.06)" },
      ticks: {
        color: "#878787",
        font: { family: "'Inter', sans-serif", size: 10 },
      },
    },
    y: {
      grid: { color: "rgba(0,0,0,0.06)" },
      ticks: {
        color: "#878787",
        font: { family: "'Inter', sans-serif", size: 10 },
      },
    },
  },
};

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
  const [error, setError] = useState(null);
  const [optimizedCart, setOptimizedCart] = useState(null);
  const [optimizedTotal, setOptimizedTotal] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [alertPrice, setAlertPrice] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false);

  const [advisor, setAdvisor] = useState(null); // LLM advisor result
  const [advisorLoading, setAdvisorLoading] = useState(false);

  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]); // conversation history
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [agentStrategy, setAgentStrategy] = useState(null);
  const [agentSavings, setAgentSavings] = useState(null);
  const [agentPipeline, setAgentPipeline] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);

  const [optimizeNotFound, setOptimizeNotFound] = useState([]);
  const [optimizeError, setOptimizeError] = useState(null);

  const cartRef = useRef();
  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price), 0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target))
        setShowCart(false);
    };
    if (showCart) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCart]);

  const addToCart = (product) => setCart((prev) => [...prev, product]);
  const removeFromCart = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
    setOptimizedCart(null);
    setOptimizedTotal(null);
    setAgentStrategy(null);
    setAgentSavings(null);
    setAgentPipeline(null);
    setOptimizeNotFound([]);
    setOptimizeError(null);
  };

  const searchProduct = async () => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setProducts([]);
      setPrices([]);
      setPrediction(null);
      setHistory([]);
      setShowGraph(false);
      setAdvisor(null);
      setAlertSuccess(false);

      const [searchRes, pricesByNameRes] = await Promise.all([
        axios.get(`${API}/search/${encodeURIComponent(query)}`),
        axios
          .get(`${API}/prices-by-name/${encodeURIComponent(query)}`)
          .catch(() => ({ data: [] })),
      ]);
      setProducts(searchRes.data);
      setPrices(pricesByNameRes.data);

      let product_id = pricesByNameRes.data[0]?.product_id;
      if (!product_id) {
        const productRes = await axios.get(
          `${API}/products?search=${encodeURIComponent(query)}`,
        );
        product_id = productRes.data[0]?.id;
      }

      if (product_id) {
        const [predRes, historyRes] = await Promise.all([
          axios
            .get(`${API}/price-prediction/${product_id}`)
            .catch(() => ({ data: null })),
          axios
            .get(`${API}/price-history/${product_id}`)
            .catch(() => ({ data: [] })),
        ]);
        if (predRes.data && !predRes.data.message) setPrediction(predRes.data);
        if (Array.isArray(historyRes.data)) setHistory(historyRes.data);

        const dealRes = await axios
          .get(`${API}/deals/${product_id}`)
          .catch(() => ({ data: {} }));
        fetchAIAdvisor(query, pricesByNameRes.data, predRes.data, dealRes.data);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Could not fetch prices. Check your internet or try again.");
      setLoading(false);
    }
  };

  const fetchAIAdvisor = async (
    productName,
    pricesData,
    predictionData,
    dealData,
  ) => {
    try {
      setAdvisorLoading(true);
      const res = await axios.post(`${API}/ai/advisor`, {
        product_name: productName,
        prices: pricesData,
        prediction: predictionData,
        deal: dealData,
      });
      setAdvisor(res.data);
    } catch (err) {
      console.error("AI Advisor error:", err);
    } finally {
      setAdvisorLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMessage = chatInput.trim();
    setChatInput("");

    const newUserMsg = { role: "user", content: userMessage };
    setChatMessages((prev) => [...prev, newUserMsg]);
    setChatLoading(true);

    setChatMessages((prev) => [...prev, { role: "thinking" }]);

    try {
      const res = await axios.post(`${API}/ai/chat`, {
        question: userMessage,
        conversation_history: chatMessages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content })),
      });

      setChatMessages((prev) => [
        ...prev.filter((m) => m.role !== "thinking"),
        {
          role: "assistant",
          content: res.data.answer,
          context_used: res.data.context_used,
          products_found: res.data.products_found,
        },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev.filter((m) => m.role !== "thinking"),
        {
          role: "assistant",
          content: "Sorry, I ran into an error. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const runAgentCartOptimizer = async () => {
    if (cart.length === 0) return;
    try {
      setAgentLoading(true);
      setAgentStrategy(null);
      setOptimizeError(null);
      setOptimizeNotFound([]);
      const res = await axios.post(`${API}/ai/cart-agent`, {
        products: cart.map((item) => item.title),
      });
      setOptimizedCart(res.data.optimized_cart);
      setOptimizedTotal(res.data.total_cost);
      setAgentStrategy(res.data.ai_strategy);
      setAgentSavings(res.data.total_savings);
      setAgentPipeline(res.data.pipeline);
    } catch (err) {
      console.error("Agent cart error:", err);
      setOptimizeError("Search for your products first so we have price data for AI optimization.");
    } finally {
      setAgentLoading(false);
    }
  };

  const setAlert = async () => {
    if (!alertPrice || isNaN(alertPrice)) return;
    try {
      await axios.post(`${API}/alerts`, {
        user_id: 1,
        product_name: query,
        target_price: Number(alertPrice),
      });
      setAlertSuccess(true);
      setAlertPrice("");
    } catch (err) {
      console.error(err);
    }
  };

  const optimizeCart = async () => {
    if (cart.length === 0) return;
    try {
      setOptimizing(true);
      setOptimizeError(null);
      setOptimizeNotFound([]);
      setAgentStrategy(null);
      setAgentSavings(null);
      setAgentPipeline(null);
      const res = await axios.post(`${API}/cart/optimize`, {
        products: cart.map((item) =>
          item.title.toLowerCase().split(" ").slice(0, 3).join(" "),
        ),
      });
      if (res.data.cart && res.data.cart.length > 0) {
        setOptimizedCart(res.data.cart);
        setOptimizedTotal(res.data.total_cost);
        if (res.data.not_found) {
          setOptimizeNotFound(res.data.not_found);
        }
      } else {
        setOptimizedTotal(-1); // signals "searched but nothing found"
      }
    } catch (err) {
      console.error(err);
      setOptimizeError("Could not optimize cart. Try searching for these products first.");
    } finally {
      setOptimizing(false);
    }
  };

  const chartData = {
    labels: history.map((h) => new Date(h.recorded_at).toLocaleDateString()),
    datasets: [
      {
        label: "Price",
        data: history.map((h) => h.price),
        borderColor: "#4f8aff",
        backgroundColor: "rgba(79,138,255,0.06)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  };

  const minPrice = products.length
    ? Math.min(...products.map((x) => x.price))
    : null;
  const maxPrice = products.length
    ? Math.max(...products.map((x) => x.price))
    : null;
  const minComparePrice = prices.length
    ? Math.min(...prices.map((x) => Number(x.price)))
    : null;
  const savings =
    minPrice && maxPrice && maxPrice !== minPrice ? maxPrice - minPrice : 0;
  const priceDir = prediction
    ? prediction.predicted_price >= prediction.current_price
      ? "up"
      : "down"
    : null;

  const verdictClass =
    advisor?.verdict === "Buy Now" || advisor?.verdict === "Good Deal"
      ? "verdict-buy"
      : advisor?.verdict === "Wait"
        ? "verdict-wait"
        : "verdict-deal";

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <nav className="navbar">
          <div className="logo">
            <span className="logo-icon">🛒</span>
            <div>
              ShopSmart AI<div className="logo-sub">Compare · Save · Shop Smart</div>
            </div>
          </div>
          <div className="nav-right">
            <button
              className={`chat-nav-btn ${showChat ? "active" : ""}`}
              onClick={() => setShowChat(!showChat)}
            >
              💬 AI Chat
            </button>
            <button className="cart-btn" onClick={() => setShowCart(!showCart)}>
              🛒 Cart{" "}
              {cart.length > 0 && (
                <span className="cart-badge">{cart.length}</span>
              )}
            </button>
          </div>
        </nav>

        <div className="hero">
          <h1 className="hero-title">
            Compare Prices. <span>Buy Smarter.</span>
          </h1>
          <p className="hero-sub">
            Real-time prices from Amazon, Flipkart & more
          </p>
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              placeholder="Search for any product…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchProduct()}
            />
            <button className="search-btn" onClick={searchProduct}>
              Search
            </button>
          </div>
          {loading && <div className="loading-text">🔍 Searching across platforms...</div>}
          {error && <div className="error-msg">⚠ {error}</div>}
        </div>

        {products.length > 0 && (
          <div className="products-section">
            <div className="section-label">
              Results · {products.length} found
            </div>
            <div className="products-grid">
              {products.map((p, i) => (
                <div
                  key={i}
                  className={`product-card ${p.price === minPrice ? "best-deal" : ""}`}
                >
                  {p.price === minPrice && (
                    <span className="best-badge">BEST DEAL</span>
                  )}
                  <div className="product-platform">{p.platform}</div>
                  <div className="product-title">{p.title}</div>
                  <div className="product-price">
                    {p.price_display || (
                      <>
                        <span>₹</span>
                        {Number(p.price).toLocaleString("en-IN")}
                      </>
                    )}
                  </div>
                  {p.price === minPrice && savings > 0 && (
                    <div className="savings-badge">
                      You save ₹{savings.toLocaleString("en-IN")}
                    </div>
                  )}
                  <button className="add-btn" onClick={() => addToCart(p)}>
                    + Add to Cart
                  </button>
                  {p.url && (
                    <a
                      className="buy-link"
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on {p.platform} ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {prices.length > 0 && (
          <div className="compare-section">
            <div className="section-label">Price Comparison</div>
            <div className="compare-grid">
              {prices.map((p, i) => (
                <div key={i} className={`compare-card${Number(p.price) === minComparePrice ? " cheapest" : ""}`}>
                  <div className="compare-platform">{p.platform}</div>
                  <div className="compare-price">
                    ₹{Number(p.price).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(advisorLoading || advisor) && products.length > 0 && (
          <div className="advisor-section">
            <div className="advisor-card">
              <div className="advisor-header">
                <div className="advisor-title">🤖 AI Shopping Advisor</div>
                {advisor && (
                  <>
                    <span className={`verdict-badge ${verdictClass}`}>
                      {advisor.verdict}
                    </span>
                    <span className={`risk-badge risk-${advisor.risk_level}`}>
                      Risk: {advisor.risk_level}
                    </span>
                  </>
                )}
                {advisorLoading && (
                  <div className="advisor-loading">
                    <span className="pulse"></span> Analyzing with Llama 3…
                  </div>
                )}
              </div>
              {advisor && !advisorLoading && (
                <>
                  <div className="advisor-summary">{advisor.summary}</div>
                  <div className="advisor-insight">
                    💡 {advisor.key_insight}
                  </div>
                  <div className="advisor-meta">
                    LLM: Llama 3 (Groq) · Prompt Engineering · Structured Output
                    · Best platform: {advisor.best_platform}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {(prediction || showGraph) && (
          <div className="ai-row">
            {prediction && !prediction.message && (
              <div className="ai-card">
                <div className="ai-card-title">📊 Price Prediction</div>
                <div className="ai-metric">
                  <span className="ai-metric-label">Current Price</span>
                  <span className="ai-metric-value">
                    ₹{Number(prediction.current_price).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="ai-metric">
                  <span className="ai-metric-label">Predicted Next</span>
                  <span
                    className={`ai-metric-value ${priceDir === "up" ? "up" : "down"}`}
                  >
                    ₹
                    {Number(prediction.predicted_price).toLocaleString("en-IN")}{" "}
                    {priceDir === "up" ? "↑" : "↓"}
                  </span>
                </div>
                <div className="ai-metric">
                  <span className="ai-metric-label">Recommendation</span>
                  <span
                    className={`ai-metric-value ${prediction.recommendation === "Buy Now" ? "up" : "down"}`}
                  >
                    {prediction.recommendation}
                  </span>
                </div>
                {prediction.reason && (
                  <div className="prediction-reason">{prediction.reason}</div>
                )}
                {prediction.confidence && (
                  <span
                    className={`confidence-badge confidence-${prediction.confidence}`}
                  >
                    {prediction.confidence.toUpperCase()} CONFIDENCE
                  </span>
                )}
                <div className="alert-form">
                  <input
                    className="alert-input"
                    type="number"
                    placeholder="Alert me at ₹..."
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(e.target.value)}
                  />
                  <button className="alert-btn" onClick={setAlert}>
                    Set Alert
                  </button>
                </div>
                {alertSuccess && (
                  <div className="alert-success">✓ Alert set!</div>
                )}
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

        {history.length > 0 && (
          <div className="trend-wrap">
            <button
              className="trend-btn"
              onClick={() => setShowGraph(!showGraph)}
            >
              {showGraph ? "Hide" : "Show"} Price History
            </button>
          </div>
        )}

        {showCart && (
          <div className="cart-sidebar" ref={cartRef}>
            <div className="cart-header">
              <span className="cart-title">My Cart ({cart.length} {cart.length === 1 ? "item" : "items"})</span>
              <button className="cart-close" onClick={() => setShowCart(false)}>
                ✕
              </button>
            </div>
            <div className="cart-body">
              {cart.length === 0 ? (
                <div className="cart-empty">Your cart is empty.</div>
              ) : (
                cart.map((item, i) => (
                  <div key={i} className="cart-item">
                    <div className="cart-item-title">{item.title}</div>
                    <div className="cart-item-price">
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </div>
                    <button
                      className="cart-remove"
                      onClick={() => removeFromCart(i)}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span className="cart-total-label">Total</span>
                  <span className="cart-total-value">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                {optimizeError && (
                  <div className="optimize-warning">
                    ⚠ {optimizeError}
                  </div>
                )}

                {optimizedTotal > 0 && (
                  <div className="optimized-total">
                    ✓ Optimized Total: ₹{Number(optimizedTotal).toLocaleString("en-IN")}
                    {totalPrice - optimizedTotal > 0 && ` (Save ₹${(totalPrice - optimizedTotal).toLocaleString("en-IN")})`}
                  </div>
                )}

                {optimizedCart && optimizedCart.length > 0 && (
                  <div className="optimized-items">
                    {optimizedCart.map((item, i) => (
                      <div key={i} className="optimized-item">
                        <span className="optimized-item-name">{item.product}</span>
                        <span className="optimized-item-detail">
                          {item.platform || item.cheapest_platform} · ₹{Number(item.price || item.cheapest_price).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {optimizeNotFound.length > 0 && (
                  <div className="optimize-warning">
                    No price data for: {optimizeNotFound.join(", ")}. Search for these products first.
                  </div>
                )}

                {optimizedTotal === -1 && (
                  <div className="optimize-warning">
                    ⚠ Search these products first so we have price data
                  </div>
                )}

                {agentStrategy && (
                  <div className="agent-strategy">
                    <div className="agent-label">
                      🤖 AI Strategy (Multi-Agent)
                    </div>
                    {agentStrategy}
                    {agentSavings > 0 && (
                      <div style={{ color: "#388e3c", fontSize: 12, fontWeight: 600, marginTop: 8 }}>
                        Total savings: ₹{Number(agentSavings).toLocaleString("en-IN")}
                      </div>
                    )}
                    {agentPipeline && (
                      <div className="agent-pipeline-badge">
                        Pipeline: {agentPipeline.agents_used.join(" → ")}
                      </div>
                    )}
                  </div>
                )}

                <button
                  className="optimize-btn"
                  onClick={runAgentCartOptimizer}
                  disabled={agentLoading}
                >
                  {agentLoading ? "🤖 Agents working..." : "🤖 AI Agent Optimize"}
                </button>
                <div className="optimize-subtitle">Multi-agent AI finds best deals across platforms</div>

                <button
                  className="optimize-btn-outlined"
                  onClick={optimizeCart}
                  disabled={optimizing}
                >
                  {optimizing ? "Optimizing..." : "⚡ Quick Optimize"}
                </button>
                <div className="optimize-subtitle">Fast database lookup for cheapest prices</div>

                <button className="checkout-btn">Proceed to Checkout →</button>
              </div>
            )}
          </div>
        )}

        {showChat && (
          <div className="chat-panel">
            <div className="chat-header">
              <div className="chat-header-left">
                <div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div className="chat-header-title">
                      AI Assistant
                    </div>
                    <span className="rag-badge">RAG</span>
                  </div>
                  <div className="chat-header-sub">
                    Answers from your real price data
                  </div>
                </div>
              </div>
              <button
                className="chat-close-btn"
                onClick={() => setShowChat(false)}
              >
                ✕
              </button>
            </div>
            <div className="chat-messages">
              {chatMessages.length === 0 && (
                <div className="chat-empty">
                  Ask me anything about products & prices.
                  <br />
                  Try: "Which laptop is cheapest right now?"
                  <br />
                  or: "Should I buy {query || "this product"} today?"
                </div>
              )}
              {chatMessages.map((msg, i) =>
                msg.role === "thinking" ? (
                  <div key={i} className="chat-msg thinking">
                    <span className="pulse"></span> Searching database…
                  </div>
                ) : (
                  <div key={i} className={`chat-msg ${msg.role}`}>
                    {msg.content}
                    {msg.role === "assistant" && msg.context_used && (
                      <div className="rag-context">
                        ✓ Answered from {msg.products_found} price records in
                        database
                      </div>
                    )}
                  </div>
                ),
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input-row">
              <input
                className="chat-input"
                placeholder="Ask about any product…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
              />
              <button
                className="chat-send-btn"
                onClick={sendChatMessage}
                disabled={chatLoading}
              >
                Send
              </button>
            </div>
          </div>
        )}

        <footer className="footer">
          <div className="footer-name">Harsh Rana 🚀</div>
          <div className="footer-sub">
            AI Smart Shopping Platform · Powered by RAG, LLM & Multi-Agent AI
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
