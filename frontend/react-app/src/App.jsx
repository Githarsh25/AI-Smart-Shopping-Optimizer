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

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #07080d; --surface: #0e1017; --surface2: #141720;
    --border: rgba(255,255,255,0.06); --accent: #4f8aff; --accent2: #a78bfa;
    --green: #34d399; --red: #f87171; --amber: #fbbf24;
    --text: #e8eaf0; --muted: #5a5f72;
    --font-head: 'Syne', sans-serif; --font-mono: 'DM Mono', monospace;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-head); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--surface2); border-radius: 4px; }
  .bg-grid {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: linear-gradient(rgba(79,138,255,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(79,138,255,0.035) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .orb { position: fixed; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0; }
  .orb-1 { width: 500px; height: 500px; top: -120px; left: -100px;
    background: radial-gradient(circle, rgba(79,138,255,0.12) 0%, transparent 70%);
    animation: driftA 18s ease-in-out infinite alternate; }
  .orb-2 { width: 400px; height: 400px; bottom: -80px; right: -60px;
    background: radial-gradient(circle, rgba(167,139,250,0.10) 0%, transparent 70%);
    animation: driftB 22s ease-in-out infinite alternate; }
  @keyframes driftA { from{transform:translate(0,0) scale(1)} to{transform:translate(60px,40px) scale(1.1)} }
  @keyframes driftB { from{transform:translate(0,0) scale(1)} to{transform:translate(-50px,-30px) scale(1.08)} }
  .app { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }

  /* NAVBAR */
  .navbar { display: flex; justify-content: space-between; align-items: center; padding: 0 48px; height: 68px;
    background: rgba(7,8,13,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100; gap: 12px; }
  .logo { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; display: flex; align-items: center; gap: 10px; }
  .logo-icon { width: 32px; height: 32px; background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-radius: 9px; display: flex; align-items: center; justify-content: center;
    font-size: 16px; box-shadow: 0 0 20px rgba(79,138,255,0.35); }
  .logo-sub { font-size: 11px; font-weight: 400; color: var(--muted); font-family: var(--font-mono); letter-spacing: 1px; }
  .nav-right { display: flex; gap: 10px; align-items: center; }

  /* NEW: AI Chat toggle button in navbar */
  .chat-nav-btn { display: flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px;
    border: 1px solid rgba(167,139,250,0.35); background: rgba(167,139,250,0.08); color: var(--accent2);
    font-family: var(--font-head); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .chat-nav-btn:hover { background: rgba(167,139,250,0.18); }
  .chat-nav-btn.active { background: rgba(167,139,250,0.2); border-color: var(--accent2); }

  .cart-btn { position: relative; display: flex; align-items: center; gap: 8px; padding: 9px 20px;
    border-radius: 10px; border: 1px solid var(--border); background: var(--surface2);
    color: var(--text); font-family: var(--font-head); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s ease; }
  .cart-btn:hover { background: var(--surface); border-color: rgba(79,138,255,0.35); }
  .cart-badge { position: absolute; top: -7px; right: -7px; background: var(--accent); color: #fff;
    font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); }

  /* HERO */
  .hero { display: flex; flex-direction: column; align-items: center; padding: 64px 24px 16px; gap: 8px; }
  .hero-tag { font-family: var(--font-mono); font-size: 11px; color: var(--accent); letter-spacing: 2px;
    text-transform: uppercase; padding: 4px 12px; border: 1px solid rgba(79,138,255,0.25);
    border-radius: 999px; background: rgba(79,138,255,0.06); }
  .hero-title { font-size: clamp(28px,5vw,52px); font-weight: 800; text-align: center; letter-spacing: -1.5px; line-height: 1.1; }
  .hero-title span { background: linear-gradient(90deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .hero-sub { color: var(--muted); font-size: 15px; text-align: center; margin-top: 4px; }
  .search-wrap { width: 100%; max-width: 680px; margin: 28px auto 0; display: flex; align-items: center;
    background: var(--surface2); border: 1px solid var(--border); border-radius: 14px; overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s; }
  .search-wrap:focus-within { border-color: rgba(79,138,255,0.4); box-shadow: 0 0 0 3px rgba(79,138,255,0.08); }
  .search-icon { padding: 0 16px; color: var(--muted); font-size: 17px; flex-shrink: 0; }
  .search-input { flex: 1; padding: 16px 0; background: transparent; border: none; outline: none;
    color: var(--text); font-family: var(--font-head); font-size: 15px; }
  .search-input::placeholder { color: var(--muted); }
  .search-btn { padding: 16px 28px; background: linear-gradient(135deg, var(--accent), #3a70e0);
    border: none; color: #fff; font-family: var(--font-head); font-weight: 700; font-size: 14px;
    cursor: pointer; transition: opacity 0.2s; white-space: nowrap; }
  .search-btn:hover { opacity: 0.9; }
  .loading-bar { width: 100%; max-width: 680px; margin: 16px auto 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent), var(--accent2), transparent);
    background-size: 300% 100%; animation: shimmer 1.2s linear infinite; border-radius: 2px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .error-msg { width: 100%; max-width: 680px; margin: 12px auto 0; padding: 10px 16px; border-radius: 10px;
    background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.25);
    color: var(--red); font-size: 14px; font-family: var(--font-mono); text-align: center; }

  .section-label { font-family: var(--font-mono); font-size: 11px; color: var(--muted); letter-spacing: 2px;
    text-transform: uppercase; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
  .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  /* PRODUCT CARDS */
  .products-section { width: 100%; max-width: 1100px; margin: 52px auto 0; padding: 0 24px; }
  .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 20px; }
  .product-card { position: relative; padding: 24px; border-radius: 16px; border: 1px solid var(--border);
    background: var(--surface); transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s; overflow: hidden; }
  .product-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(0,0,0,0.5); border-color: rgba(79,138,255,0.2); }
  .product-card.best-deal { border-color: rgba(52,211,153,0.35); background: rgba(52,211,153,0.04); }
  .best-badge { position: absolute; top: 16px; right: 16px; background: rgba(52,211,153,0.15);
    border: 1px solid rgba(52,211,153,0.3); color: var(--green); font-family: var(--font-mono);
    font-size: 10px; padding: 3px 10px; border-radius: 999px; letter-spacing: 1px; }
  .product-platform { font-family: var(--font-mono); font-size: 11px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
  .product-title { font-size: 15px; font-weight: 600; line-height: 1.4; color: var(--text); margin-bottom: 14px; }
  .product-price { font-size: 30px; font-weight: 800; letter-spacing: -1px; font-family: var(--font-mono);
    background: linear-gradient(90deg, #fff, rgba(255,255,255,0.7)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .savings-badge { font-family: var(--font-mono); font-size: 12px; color: var(--green); margin-top: 6px; }
  .add-btn { margin-top: 20px; width: 100%; padding: 11px; border: 1px solid rgba(79,138,255,0.3);
    border-radius: 10px; background: rgba(79,138,255,0.08); color: var(--accent);
    font-family: var(--font-head); font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; }
  .add-btn:hover { background: rgba(79,138,255,0.18); }
  .buy-link { display: block; margin-top: 8px; text-align: center; font-family: var(--font-mono);
    font-size: 11px; color: var(--muted); text-decoration: none; transition: color 0.2s; }
  .buy-link:hover { color: var(--accent); }

  /* COMPARE */
  .compare-section { width: 100%; max-width: 1100px; margin: 52px auto 0; padding: 0 24px; }
  .compare-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
  .compare-card { padding: 16px 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; font-family: var(--font-mono); }
  .compare-platform { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .compare-price { font-size: 20px; font-weight: 500; color: var(--text); }

  /* AI ROW */
  .ai-row { width: 100%; max-width: 1100px; margin: 52px auto 0; padding: 0 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media (max-width: 768px) { .ai-row { grid-template-columns: 1fr; } }
  .ai-card { padding: 28px; border-radius: 16px; border: 1px solid rgba(79,138,255,0.2);
    background: linear-gradient(135deg, rgba(79,138,255,0.06), rgba(167,139,250,0.04)); }
  .ai-card-title { font-family: var(--font-mono); font-size: 11px; color: var(--accent); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
  .ai-metric { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .ai-metric:last-of-type { border-bottom: none; }
  .ai-metric-label { font-size: 13px; color: var(--muted); font-family: var(--font-mono); }
  .ai-metric-value { font-size: 20px; font-weight: 700; font-family: var(--font-mono); color: var(--text); }
  .ai-metric-value.up { color: var(--green); }
  .ai-metric-value.down { color: var(--red); }
  .prediction-reason { font-family: var(--font-mono); font-size: 12px; color: var(--muted); margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); line-height: 1.5; }
  .confidence-badge { display: inline-block; font-family: var(--font-mono); font-size: 10px; letter-spacing: 1px; padding: 3px 10px; border-radius: 999px; margin-top: 10px; }
  .confidence-high   { background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.3); color: var(--green); }
  .confidence-medium { background: rgba(251,191,36,0.12);  border: 1px solid rgba(251,191,36,0.3);  color: var(--amber); }
  .confidence-low    { background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.3); color: var(--red); }
  .alert-form { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; }
  .alert-input { flex: 1; padding: 9px 12px; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text); font-family: var(--font-mono); font-size: 13px; outline: none; }
  .alert-input:focus { border-color: rgba(79,138,255,0.4); }
  .alert-btn { padding: 9px 16px; border-radius: 8px; border: 1px solid rgba(167,139,250,0.35);
    background: rgba(167,139,250,0.1); color: var(--accent2); font-family: var(--font-head);
    font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
  .alert-btn:hover { background: rgba(167,139,250,0.2); }
  .alert-success { font-family: var(--font-mono); font-size: 12px; color: var(--green); margin-top: 8px; }
  .graph-card { padding: 28px; border-radius: 16px; border: 1px solid var(--border); background: var(--surface); }
  .graph-card-title { font-family: var(--font-mono); font-size: 11px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
  .trend-wrap { text-align: center; margin: 32px 0 0; }
  .trend-btn { padding: 12px 32px; border-radius: 10px; border: 1px solid rgba(167,139,250,0.35);
    background: rgba(167,139,250,0.08); color: var(--accent2); font-family: var(--font-head);
    font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; }
  .trend-btn:hover { background: rgba(167,139,250,0.16); }

  /* ── NEW: AI ADVISOR CARD ── */
  .advisor-section { width: 100%; max-width: 1100px; margin: 32px auto 0; padding: 0 24px; }
  .advisor-card { padding: 28px; border-radius: 16px;
    border: 1px solid rgba(52,211,153,0.25);
    background: linear-gradient(135deg, rgba(52,211,153,0.05), rgba(79,138,255,0.03)); }
  .advisor-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
  .advisor-title { font-family: var(--font-mono); font-size: 11px; color: var(--green); letter-spacing: 2px; text-transform: uppercase; }
  .advisor-loading { font-family: var(--font-mono); font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 8px; }
  .pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: pulse 1s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .verdict-badge { font-family: var(--font-mono); font-size: 12px; font-weight: 500; padding: 4px 14px;
    border-radius: 999px; letter-spacing: 1px; }
  .verdict-buy    { background: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.3); color: var(--green); }
  .verdict-wait   { background: rgba(251,191,36,0.15);  border: 1px solid rgba(251,191,36,0.3);  color: var(--amber); }
  .verdict-deal   { background: rgba(79,138,255,0.15);  border: 1px solid rgba(79,138,255,0.3);  color: var(--accent); }
  .risk-badge { font-family: var(--font-mono); font-size: 10px; padding: 3px 10px; border-radius: 999px; }
  .risk-Low    { background: rgba(52,211,153,0.1);  border: 1px solid rgba(52,211,153,0.2);  color: var(--green); }
  .risk-Medium { background: rgba(251,191,36,0.1);  border: 1px solid rgba(251,191,36,0.2);  color: var(--amber); }
  .risk-High   { background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2); color: var(--red); }
  .advisor-summary { font-size: 15px; color: var(--text); line-height: 1.7; margin-bottom: 14px; }
  .advisor-insight { font-family: var(--font-mono); font-size: 12px; color: var(--muted); line-height: 1.6;
    padding: 12px 16px; background: var(--surface2); border-radius: 8px; border-left: 3px solid var(--accent); }
  .advisor-meta { font-family: var(--font-mono); font-size: 10px; color: var(--muted); margin-top: 12px; letter-spacing: 1px; }

  /* ── NEW: RAG CHAT ── */
  .chat-panel { position: fixed; bottom: 0; right: 24px; width: 380px; z-index: 150;
    background: var(--surface); border: 1px solid var(--border); border-bottom: none;
    border-radius: 16px 16px 0 0; box-shadow: 0 -20px 60px rgba(0,0,0,0.5);
    display: flex; flex-direction: column; max-height: 520px; }
  .chat-header { padding: 16px 20px; border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
  .chat-header-left { display: flex; align-items: center; gap: 8px; }
  .chat-header-title { font-size: 14px; font-weight: 700; }
  .chat-header-sub { font-family: var(--font-mono); font-size: 10px; color: var(--muted); letter-spacing: 1px; }
  .rag-badge { font-family: var(--font-mono); font-size: 9px; letter-spacing: 1px; padding: 2px 7px;
    border-radius: 4px; background: rgba(167,139,250,0.15); border: 1px solid rgba(167,139,250,0.3); color: var(--accent2); }
  .chat-close-btn { width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--border);
    background: transparent; color: var(--muted); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .chat-msg { max-width: 88%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.6; }
  .chat-msg.user { background: rgba(79,138,255,0.15); border: 1px solid rgba(79,138,255,0.2);
    color: var(--text); align-self: flex-end; }
  .chat-msg.assistant { background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); align-self: flex-start; }
  .chat-msg.assistant .rag-context { font-family: var(--font-mono); font-size: 10px;
    color: var(--green); margin-top: 6px; }
  .chat-msg.thinking { background: var(--surface2); border: 1px solid var(--border);
    color: var(--muted); align-self: flex-start; font-family: var(--font-mono); font-size: 12px;
    display: flex; align-items: center; gap: 8px; }
  .chat-empty { font-family: var(--font-mono); font-size: 12px; color: var(--muted); text-align: center;
    padding: 20px 0; line-height: 1.8; }
  .chat-input-row { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; flex-shrink: 0; }
  .chat-input { flex: 1; padding: 10px 12px; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text); font-family: var(--font-head); font-size: 13px; outline: none; }
  .chat-input:focus { border-color: rgba(167,139,250,0.4); }
  .chat-send-btn { padding: 10px 16px; border-radius: 8px; border: none;
    background: linear-gradient(135deg, var(--accent2), var(--accent)); color: #fff;
    font-family: var(--font-head); font-weight: 700; font-size: 13px; cursor: pointer; white-space: nowrap; }
  .chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* CART */
  .cart-sidebar { position: fixed; top: 0; right: 0; height: 100%; width: 360px; background: var(--surface);
    border-left: 1px solid var(--border); z-index: 200; display: flex; flex-direction: column; box-shadow: -20px 0 60px rgba(0,0,0,0.5); }
  .cart-header { padding: 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .cart-title { font-size: 16px; font-weight: 700; }
  .cart-close { width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--muted); font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .cart-body { flex: 1; overflow-y: auto; padding: 16px 24px; }
  .cart-empty { color: var(--muted); font-family: var(--font-mono); font-size: 13px; margin-top: 20px; }
  .cart-item { padding: 14px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface2); margin-bottom: 10px; }
  .cart-item-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
  .cart-item-price { font-family: var(--font-mono); font-size: 15px; color: var(--accent); }
  .cart-remove { background: none; border: none; color: var(--muted); font-size: 12px; cursor: pointer; margin-top: 6px; font-family: var(--font-mono); }
  .cart-remove:hover { color: var(--red); }
  .cart-footer { padding: 20px 24px; border-top: 1px solid var(--border); }
  .cart-total { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .cart-total-label { font-size: 13px; color: var(--muted); font-family: var(--font-mono); }
  .cart-total-value { font-family: var(--font-mono); font-size: 22px; font-weight: 700; }
  .optimize-btn { width: 100%; padding: 11px; border-radius: 10px; margin-bottom: 10px;
    border: 1px solid rgba(52,211,153,0.35); background: rgba(52,211,153,0.08); color: var(--green);
    font-family: var(--font-head); font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; }
  .optimize-btn:hover:not(:disabled) { background: rgba(52,211,153,0.16); }
  .optimize-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .optimized-total { font-family: var(--font-mono); font-size: 13px; color: var(--green); margin-bottom: 10px; }

  /* NEW: AI Cart Agent result styles */
  .agent-strategy { margin: 12px 0; padding: 12px 14px; border-radius: 10px;
    background: rgba(167,139,250,0.08); border: 1px solid rgba(167,139,250,0.2);
    font-size: 13px; color: var(--text); line-height: 1.65; }
  .agent-label { font-family: var(--font-mono); font-size: 10px; color: var(--accent2);
    letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
  .agent-pipeline-badge { font-family: var(--font-mono); font-size: 10px; color: var(--muted);
    margin-top: 10px; letter-spacing: 0.5px; }

  .checkout-btn { width: 100%; padding: 14px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff;
    font-family: var(--font-head); font-weight: 700; font-size: 14px; cursor: pointer; margin-top: 10px; }

  .footer { margin-top: 80px; padding: 28px; text-align: center; border-top: 1px solid var(--border); }
  .footer-name { font-weight: 700; font-size: 14px; }
  .footer-sub { font-family: var(--font-mono); font-size: 11px; color: var(--muted); margin-top: 4px; letter-spacing: 1px; }
`;

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  scales: {
    x: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: {
        color: "#5a5f72",
        font: { family: "'DM Mono', monospace", size: 10 },
      },
    },
    y: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: {
        color: "#5a5f72",
        font: { family: "'DM Mono', monospace", size: 10 },
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
      const res = await axios.post(`${API}/cart/optimize`, {
        products: cart.map((item) =>
          item.title.toLowerCase().split(" ").slice(0, 3).join(" "),
        ),
      });
      if (res.data.cart && res.data.cart.length > 0) {
        setOptimizedCart(res.data.cart);
        setOptimizedTotal(res.data.total_cost);
      } else {
        setOptimizedTotal(-1); // signals "searched but nothing found"
      }
    } catch (err) {
      console.error(err);
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
      <div className="bg-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="app">
        <nav className="navbar">
          <div className="logo">
            <div className="logo-icon">🛒</div>
            <div>
              Smart Shopping<div className="logo-sub">AI POWERED</div>
            </div>
          </div>
          <div className="nav-right">
            <button
              className={`chat-nav-btn ${showChat ? "active" : ""}`}
              onClick={() => setShowChat(!showChat)}
            >
              🧠 AI Chat {showChat ? "▼" : "▲"}
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
          <div className="hero-tag">
            price intelligence engine · RAG powered
          </div>
          <h1 className="hero-title">
            Find the best deal,
            <br />
            <span>powered by AI</span>
          </h1>
          <p className="hero-sub">
            Compare prices · Predict trends · Ask AI anything
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
          {loading && <div className="loading-bar" />}
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
                      ✓ Save ₹{savings.toLocaleString("en-IN")} vs highest
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
                <div key={i} className="compare-card">
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
                    🔔 Notify Me
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
              {showGraph ? "Hide" : "Show"} Trend Analysis
            </button>
          </div>
        )}

        {showCart && (
          <div className="cart-sidebar" ref={cartRef}>
            <div className="cart-header">
              <span className="cart-title">Your Cart · {cart.length}</span>
              <button className="cart-close" onClick={() => setShowCart(false)}>
                ✕
              </button>
            </div>
            <div className="cart-body">
              {cart.length === 0 ? (
                <div className="cart-empty">No items yet.</div>
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
                {optimizedTotal > 0 && (
                  <div className="optimized-total">
                    ✓ Optimized: ₹
                    {Number(optimizedTotal).toLocaleString("en-IN")} (Save ₹
                    {(totalPrice - optimizedTotal).toLocaleString("en-IN")})
                  </div>
                )}
                {optimizedTotal === -1 && (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--amber)",
                      marginBottom: 10,
                    }}
                  >
                    ⚠ Search these products first so we have price data for them
                  </div>
                )}

                {agentStrategy && (
                  <div className="agent-strategy">
                    <div className="agent-label">
                      🤖 AI Strategy (Multi-Agent)
                    </div>
                    {agentStrategy}
                    {agentSavings > 0 && (
                      <div
                        style={{
                          color: "var(--green)",
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          marginTop: 8,
                        }}
                      >
                        Total savings: ₹
                        {Number(agentSavings).toLocaleString("en-IN")}
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
                  {agentLoading
                    ? "🤖 Agents working..."
                    : "🤖 AI Agent Optimize"}
                </button>
                <button
                  className="optimize-btn"
                  onClick={optimizeCart}
                  disabled={optimizing}
                  style={{
                    background: "rgba(79,138,255,0.08)",
                    borderColor: "rgba(79,138,255,0.35)",
                    color: "var(--accent)",
                  }}
                >
                  {optimizing ? "Optimizing..." : "⚡ Quick Optimize"}
                </button>
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
                      AI Shopping Assistant
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
            AI SMART SHOPPING PLATFORM · RAG · LLM · MULTI-AGENT
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
