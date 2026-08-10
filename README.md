<p align="center">
  <img src="https://img.shields.io/badge/AI-Smart%20Shopping%20Optimizer-blueviolet?style=for-the-badge&logo=robot&logoColor=white" alt="Project Badge" />
</p>

<h1 align="center">🛒 AI Smart Shopping Optimizer</h1>

<p align="center">
  <strong>An AI-powered price comparison & smart shopping platform that helps you find the best deals across e-commerce platforms using real-time data, price predictions, and multi-agent LLM workflows.</strong>
</p>

<p align="center">
  <a href="#-live-demo"><img src="https://img.shields.io/badge/Live%20Demo-▶%20Try%20Now-brightgreen?style=for-the-badge" alt="Live Demo" /></a>
  <a href="#-api-documentation"><img src="https://img.shields.io/badge/API%20Docs-📖%20Read-blue?style=for-the-badge" alt="API Docs" /></a>
  <a href="#-local-setup-guide"><img src="https://img.shields.io/badge/Setup-🔧%20Guide-orange?style=for-the-badge" alt="Setup Guide" /></a>
</p>

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Live Demo](#-live-demo)
- [📦 Local Setup Guide](#-local-setup-guide)
- [📖 API Documentation](#-api-documentation)
- [🗄️ Database Schema](#️-database-schema)
- [📁 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Real-Time Product Search** | Search products across multiple e-commerce platforms (Amazon, Flipkart, etc.) via SerpAPI |
| 💰 **Cross-Platform Price Comparison** | Side-by-side price comparison table highlighting the cheapest option |
| 📈 **Price History Charts** | Interactive Chart.js line graphs showing historical price trends |
| 🤖 **AI Shopping Advisor** | LLM-powered buy/wait recommendations using Groq (Llama 3) with risk analysis |
| 🔮 **Price Prediction Engine** | Weighted moving average algorithm predicting future prices with confidence scores |
| 💬 **RAG AI Chat Assistant** | Conversational shopping assistant with Retrieval-Augmented Generation pipeline |
| 🧠 **Multi-Agent Cart Optimizer** | Sequential Producer → Consumer agent pipeline for intelligent cart optimization |
| 🔔 **Price Drop Alerts** | Set target price alerts with automated cron-based monitoring |
| 🛒 **Smart Cart Management** | Add/remove products with AI-powered and rule-based cart optimization |
| 🎯 **Deal Detection** | Automatically identifies products with >10% price drops from historical averages |
| 🌗 **Dark/Light Theme** | Toggle between dark and light modes with persistent preference |

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph CLIENT["🖥️ Frontend — React + Vite"]
        UI["App.jsx<br/>Single Page Application"]
        SEARCH["Search Bar"]
        CARDS["Product Cards Grid"]
        CHART["Price History Chart<br/>(Chart.js)"]
        ADVISOR["AI Advisor Panel"]
        CHAT["RAG Chat Assistant"]
        CART["Cart Drawer"]
        AGENT["Cart Agent Panel"]
        ALERTS["Price Alerts"]
    end

    subgraph SERVER["⚙️ Backend — Node.js + Express"]
        API["Express Server<br/>(server.js)"]
        
        subgraph ROUTES["API Routes"]
            R1["/search"]
            R2["/prices"]
            R3["/products"]
            R4["/best-price"]
            R5["/price-prediction"]
            R6["/deals"]
            R7["/cart"]
            R8["/alerts"]
            R9["/prices-by-name"]
            R10["/price-history"]
        end
        
        subgraph AI_ROUTES["AI Routes"]
            A1["/ai/advisor"]
            A2["/ai/chat — RAG Pipeline"]
            A3["/ai/cart-agent — Multi-Agent"]
        end
        
        CRON["⏰ Cron Jobs<br/>Price Checker (Hourly)<br/>Data Cleanup (Weekly)"]
    end

    subgraph EXTERNAL["🌐 External Services"]
        SERP["SerpAPI<br/>Google Shopping"]
        GROQ["Groq API<br/>Llama 3 LLM"]
    end

    subgraph DATABASE["🗄️ PostgreSQL — Neon DB"]
        TB_PROD["products"]
        TB_PRICES["product_prices"]
        TB_PLAT["platforms"]
        TB_ALERTS["alerts"]
        TB_USERS["users"]
    end

    subgraph DEPLOY["☁️ Deployment"]
        VERCEL_FE["Vercel<br/>Frontend"]
        VERCEL_BE["Vercel Serverless<br/>Backend API"]
    end

    UI --> API
    SEARCH -->|GET /search| R1
    CARDS -->|GET /prices, /deals| R2 & R6
    CHART -->|GET /price-history| R10
    ADVISOR -->|POST /ai/advisor| A1
    CHAT -->|POST /ai/chat| A2
    CART -->|POST /cart/optimize| R7
    AGENT -->|POST /ai/cart-agent| A3
    ALERTS -->|POST & GET /alerts| R8

    R1 -->|Live Price Scraping| SERP
    CRON -->|Scheduled Checks| SERP
    A1 & A2 & A3 -->|LLM Inference| GROQ

    ROUTES --> DATABASE
    AI_ROUTES --> DATABASE
    CRON --> DATABASE

    CLIENT --> VERCEL_FE
    SERVER --> VERCEL_BE
```

### Data Flow — User Search Journey

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant FE as 🖥️ React Frontend
    participant BE as ⚙️ Express Backend
    participant SERP as 🔍 SerpAPI
    participant DB as 🗄️ PostgreSQL
    participant GROQ as 🤖 Groq LLM

    U->>FE: Enters product search query
    FE->>BE: GET /search/:query
    BE->>SERP: Fetch Google Shopping results
    SERP-->>BE: Product listings + prices
    BE->>DB: Upsert products & prices
    BE-->>FE: Return product results

    par Parallel Requests
        FE->>BE: GET /prices-by-name/:query
        BE->>DB: Query price comparisons
        BE-->>FE: Platform price table
    and
        FE->>BE: GET /price-prediction/:id
        BE->>DB: Fetch price history
        BE-->>FE: Prediction + recommendation
    and
        FE->>BE: GET /price-history/:id
        BE->>DB: Fetch historical records
        BE-->>FE: Chart data points
    and
        FE->>BE: GET /deals/:id
        BE->>DB: Analyze discount vs average
        BE-->>FE: Deal evaluation
    end

    U->>FE: Clicks "Get AI Advice"
    FE->>BE: POST /ai/advisor
    BE->>DB: Fetch product context
    BE->>GROQ: Send context + prompt
    GROQ-->>BE: Structured advice JSON
    BE-->>FE: Verdict, risk, insights
    FE-->>U: Display AI recommendation
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| ![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=white) | UI Framework |
| ![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white) | Build Tool & Dev Server |
| ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | Utility-First CSS |
| ![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?style=flat-square&logo=chartdotjs&logoColor=white) | Price History Visualization |
| ![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=flat-square&logo=axios&logoColor=white) | HTTP Client |

### Backend

| Technology | Purpose |
|---|---|
| ![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=nodedotjs&logoColor=white) | Runtime Environment |
| ![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white) | Web Framework |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white) | Relational Database |
| ![Neon](https://img.shields.io/badge/Neon_DB-Serverless-00E699?style=flat-square&logo=neon&logoColor=white) | Cloud PostgreSQL |

### AI & APIs

| Technology | Purpose |
|---|---|
| ![Groq](https://img.shields.io/badge/Groq-Llama_3-F55036?style=flat-square&logo=meta&logoColor=white) | LLM Inference (AI Advisor, RAG Chat, Cart Agent) |
| ![SerpAPI](https://img.shields.io/badge/SerpAPI-Google_Shopping-4285F4?style=flat-square&logo=google&logoColor=white) | Real-Time Product Scraping |

### DevOps & Deployment

| Technology | Purpose |
|---|---|
| ![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?style=flat-square&logo=vercel&logoColor=white) | Frontend & Backend Hosting |
| ![node-cron](https://img.shields.io/badge/node--cron-Scheduling-339933?style=flat-square&logo=nodedotjs&logoColor=white) | Automated Price Checks |

---

## 🚀 Live Demo

| Service | URL | Platform |
|---|---|---|
| 🖥️ **Frontend App** | [https://ai-smart-shopping-optimizer.vercel.app](https://ai-smart-shopping-optimizer.vercel.app) | ![Vercel](https://img.shields.io/badge/Vercel-000?style=flat-square&logo=vercel) |
| ⚙️ **Backend API** | [https://ai-smart-shopping-optimizer-backend.vercel.app](https://ai-smart-shopping-optimizer-backend.vercel.app) | ![Vercel](https://img.shields.io/badge/Vercel-000?style=flat-square&logo=vercel) |

> [!NOTE]
> If you've deployed to different URLs, update the links above with your actual Vercel/Netlify/Render deployment URLs.

---

## 📦 Local Setup Guide

### Prerequisites

Ensure the following are installed on your machine:

| Tool | Version | Installation |
|---|---|---|
| **Node.js** | ≥ 18.x | [nodejs.org](https://nodejs.org/) |
| **npm** | ≥ 9.x | Comes with Node.js |
| **PostgreSQL** | ≥ 14.x | [postgresql.org](https://www.postgresql.org/download/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Githarsh25/AI-Smart-Shopping-Optimizer.git
cd AI-Smart-Shopping-Optimizer
```

---

### Step 2 — Set Up the Database

1. **Create a PostgreSQL database** (locally or use [Neon](https://neon.tech/) for serverless):

```bash
psql -U postgres
CREATE DATABASE shopping_database;
\c shopping_database
```

2. **Run the schema migration:**

```bash
psql -U postgres -d shopping_database -f backend/database/schema.sql
```

---

### Step 3 — Configure Backend Environment

1. Navigate to the backend directory and create a `.env` file:

```bash
cd backend
```

2. Create/edit `.env` with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/shopping_database
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=shopping_database
DB_PORT=5432

# Server
PORT=5000

# External APIs
SERP_API_KEY=your_serpapi_key          # Get from https://serpapi.com/
GROQ_API_KEY=your_groq_api_key        # Get from https://console.groq.com/

# CORS (optional)
ALLOWED_ORIGIN=http://localhost:5173
```

> [!IMPORTANT]
> You must obtain valid API keys:
> - **SerpAPI Key** — Sign up at [serpapi.com](https://serpapi.com/) (free tier: 100 searches/month)
> - **Groq API Key** — Sign up at [console.groq.com](https://console.groq.com/) (free tier available)

---

### Step 4 — Install Backend Dependencies & Start Server

```bash
cd backend
npm install
npm run dev        # Starts with nodemon (hot-reload)
# OR
npm start          # Starts with node (production)
```

✅ Backend will be running at **`http://localhost:5000`**

You should see:
```
Server running on port 5000
```

---

### Step 5 — Configure Frontend Environment

```bash
cd frontend/react-app
```

Create/edit `.env`:

```env
VITE_API_URL=http://localhost:5000
```

---

### Step 6 — Install Frontend Dependencies & Start Dev Server

```bash
cd frontend/react-app
npm install
npm run dev
```

✅ Frontend will be running at **`http://localhost:5173`**

---

### Step 7 — Open in Browser

Navigate to **[http://localhost:5173](http://localhost:5173)** and start searching for products! 🎉

---

### Quick Start (TL;DR)

```bash
# Clone
git clone https://github.com/Githarsh25/AI-Smart-Shopping-Optimizer.git
cd AI-Smart-Shopping-Optimizer

# Backend
cd backend
cp .env.example .env          # Edit with your API keys & DB URL
npm install
npm run dev &

# Frontend
cd ../frontend/react-app
cp .env.example .env          # Set VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

---

## 📖 API Documentation

**Base URL:** `http://localhost:5000` (local) or your deployed backend URL

---

### 🔍 Product Search

#### `GET /search/:query`

Search for products across e-commerce platforms in real-time.

| Parameter | Type | In | Required | Description |
|---|---|---|---|---|
| `query` | string | path | ✅ | Product search query (e.g., `iphone 15`) |

**Response** `200 OK`

```json
[
  {
    "title": "Apple iPhone 15 (128 GB) - Black",
    "price": 65999,
    "price_display": "₹65,999",
    "platform": "Amazon.in",
    "url": "https://...",
    "thumbnail": "https://..."
  }
]
```

---

### 💰 Price Comparison

#### `GET /prices/:product_id`

Get the latest price for a product across all tracked platforms.

| Parameter | Type | In | Required | Description |
|---|---|---|---|---|
| `product_id` | integer | path | ✅ | Product ID |

**Response** `200 OK`

```json
[
  { "platform": "Flipkart", "price": "64999" },
  { "platform": "Amazon.in", "price": "65999" }
]
```

#### `GET /prices-by-name/:name`

Search prices by product name (fuzzy matching).

| Parameter | Type | In | Required | Description |
|---|---|---|---|---|
| `name` | string | path | ✅ | Product name (min 2 characters) |

**Response** `200 OK`

```json
[
  {
    "product_name": "iphone 15",
    "product_id": 1,
    "platform": "Flipkart",
    "price": "64999"
  }
]
```

---

### 📊 Price Analytics

#### `GET /best-price/:product_id`

Get the lowest current price and platform.

**Response** `200 OK`

```json
{
  "platform": "Flipkart",
  "price": "64999"
}
```

#### `GET /price-history/:product_id`

Get historical price records for charting.

**Response** `200 OK`

```json
[
  {
    "price": 65999,
    "recorded_at": "2026-08-10T10:00:00.000Z",
    "platform": "Amazon.in"
  }
]
```

#### `GET /price-prediction/:product_id`

Get AI-powered price prediction and buy recommendation.

**Response** `200 OK`

```json
{
  "current_price": 65999,
  "predicted_price": 64500,
  "recommendation": "Wait",
  "reason": "Price likely to drop by ₹1,499",
  "confidence": "high"
}
```

---

### 🏷️ Deals

#### `GET /deals/:product_id`

Evaluate deal quality based on historical price analysis.

**Response** `200 OK`

```json
{
  "deal": true,
  "discount_percentage": 12,
  "current_price": 64999,
  "average_price": 73862,
  "is_all_time_low": true,
  "data_points_used": 15
}
```

---

### 🛒 Cart

#### `POST /cart/optimize`

Optimize cart by finding cheapest prices across platforms.

**Request Body:**

```json
{
  "products": ["iphone 15", "sony wh-1000xm5"]
}
```

**Response** `200 OK`

```json
{
  "cart": [
    { "product": "iphone 15", "platform": "Flipkart", "price": 64999 }
  ],
  "total_cost": 64999,
  "not_found": ["sony wh-1000xm5"]
}
```

---

### 🔔 Price Alerts

#### `POST /alerts`

Create a new price alert.

**Request Body:**

```json
{
  "user_id": 1,
  "product_name": "iphone 15",
  "target_price": 60000
}
```

**Response** `201 Created`

```json
{
  "id": 1,
  "user_id": 1,
  "product_id": 5,
  "target_price": 60000,
  "created_at": "2026-08-10T12:00:00.000Z"
}
```

#### `GET /alerts/:user_id`

Get all active alerts for a user.

**Response** `200 OK`

```json
[
  {
    "id": 1,
    "product_name": "iphone 15",
    "target_price": 60000,
    "created_at": "2026-08-10T12:00:00.000Z"
  }
]
```

---

### 📦 Products

#### `GET /products`

List all tracked products.

| Parameter | Type | In | Required | Description |
|---|---|---|---|---|
| `search` | string | query | ❌ | Filter by name (case-insensitive) |

**Response** `200 OK`

```json
[
  {
    "id": 1,
    "name": "iphone 15",
    "category": "electronics",
    "created_at": "2026-08-10T12:00:00.000Z"
  }
]
```

---

### 🤖 AI Endpoints

#### `POST /ai/advisor`

Get AI-powered shopping advice using Llama 3 (Groq).

**Request Body:**

```json
{
  "product_name": "iphone 15",
  "prices": [...],
  "prediction": {...},
  "deal": {...}
}
```

**Response** `200 OK`

```json
{
  "verdict": "Wait",
  "summary": "iPhone 15 is currently ₹64,999 on Flipkart. Prices are expected to drop during upcoming sales.",
  "best_platform": "Flipkart",
  "risk_level": "Low",
  "key_insight": "Price has dropped 5% in the last 7 days.",
  "buy_reason": "Wait for festive sale discount."
}
```

---

#### `POST /ai/chat`

RAG-powered conversational shopping assistant.

**Request Body:**

```json
{
  "question": "What is the best price for iPhone 15?",
  "conversation_history": []
}
```

**Response** `200 OK`

```json
{
  "answer": "The lowest price for iPhone 15 in our database is ₹64,999 on Flipkart...",
  "context_used": true,
  "products_found": 2,
  "assistant_message": { "role": "assistant", "content": "..." }
}
```

---

#### `POST /ai/cart-agent`

Multi-agent cart optimization with sequential Producer → Consumer pipeline.

**Request Body:**

```json
{
  "products": ["iphone 15", "airpods pro"]
}
```

**Response** `200 OK`

```json
{
  "optimized_cart": [
    {
      "product": "iphone 15",
      "cheapest_platform": "Flipkart",
      "cheapest_price": 64999,
      "most_expensive_price": 69900,
      "platforms_compared": 3,
      "savings_vs_most_expensive": 4901
    }
  ],
  "total_cost": 64999,
  "total_savings": 4901,
  "ai_strategy": "You can save ₹4,901 by purchasing iPhone 15 on Flipkart...",
  "pipeline": {
    "agents_used": ["Price Analyst Agent", "Shopping Strategist Agent"],
    "pattern": "Sequential Producer → Consumer",
    "agent1_role": "Data retrieval and structured price analysis",
    "agent2_role": "Natural language strategy generation"
  }
}
```

---

### ❌ Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error description message"
}
```

| Status Code | Description |
|---|---|
| `400` | Bad Request — Missing or invalid parameters |
| `404` | Not Found — Resource does not exist |
| `500` | Internal Server Error — Server-side failure |

---

## 🗄️ Database Schema

```mermaid
erDiagram
    USERS {
        int id PK
        varchar email UK
        text password_hash
        timestamp created_at
    }
    
    PRODUCTS {
        int id PK
        varchar name
        varchar category
        timestamp created_at
    }
    
    PLATFORMS {
        int id PK
        varchar name
    }
    
    PRODUCT_PRICES {
        int id PK
        int product_id FK
        int platform_id FK
        numeric price
        timestamp recorded_at
    }
    
    ALERTS {
        int id PK
        int user_id FK
        int product_id FK
        numeric target_price
        timestamp created_at
    }
    
    USERS ||--o{ ALERTS : "sets"
    PRODUCTS ||--o{ PRODUCT_PRICES : "has"
    PRODUCTS ||--o{ ALERTS : "monitored by"
    PLATFORMS ||--o{ PRODUCT_PRICES : "listed on"
```

---

## 📁 Project Structure

```
AI-Smart-Shopping-Optimizer/
│
├── 📂 backend/                     # Node.js + Express API Server
│   ├── 📂 api/
│   │   └── index.js                # Vercel serverless entry point
│   ├── 📂 cron/
│   │   └── priceChecker.js         # Hourly price alerts + weekly cleanup
│   ├── 📂 database/
│   │   └── schema.sql              # PostgreSQL schema definition
│   ├── 📂 routes/
│   │   ├── search.js               # Product search via SerpAPI
│   │   ├── prices.js               # Price comparison by product ID
│   │   ├── pricesByName.js         # Fuzzy price search by name
│   │   ├── priceHistory.js         # Historical price data
│   │   ├── bestPrice.js            # Lowest price finder
│   │   ├── prediction.js           # Price prediction engine
│   │   ├── deals.js                # Deal evaluation
│   │   ├── products.js             # Product CRUD
│   │   ├── cart.js                 # Cart optimization
│   │   ├── alerts.js               # Price alert management
│   │   ├── aiAdvisor.js            # LLM shopping advisor
│   │   ├── aiChat.js               # RAG chat pipeline
│   │   └── aiCartAgent.js          # Multi-agent cart optimizer
│   ├── db.js                       # PostgreSQL connection pool
│   ├── server.js                   # Express app configuration
│   ├── vercel.json                 # Vercel deployment config
│   ├── package.json
│   └── .env                        # Environment variables
│
├── 📂 frontend/
│   └── 📂 react-app/              # React + Vite SPA
│       ├── 📂 src/
│       │   ├── App.jsx             # Main application component
│       │   ├── main.jsx            # React entry point
│       │   └── index.css           # Tailwind CSS imports
│       ├── index.html              # HTML template
│       ├── vite.config.js          # Vite configuration
│       ├── tailwind.config.js      # Tailwind CSS config
│       ├── postcss.config.js       # PostCSS configuration
│       ├── package.json
│       └── .env                    # Frontend env (VITE_API_URL)
│
├── 📂 ai-services/                 # Reserved for future AI microservices
├── 📂 docs/                        # Documentation
└── README.md                       # ← You are here
```

---

## 🔄 Automated Background Jobs

| Job | Schedule | Description |
|---|---|---|
| **Price Alert Checker** | `0 * * * *` (Every hour) | Scans active alerts, triggers notifications when target price is met |
| **Data Cleanup** | `0 0 * * 0` (Weekly, Sunday midnight) | Removes price records older than 90 days |

> [!NOTE]
> Cron jobs only run in traditional server mode (not on Vercel serverless). For production scheduling on Vercel, consider using [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) or an external scheduler.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push** to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Made with ❤️ by <strong>Harsh Rana</strong> 🚀
</p>

<p align="center">
  <a href="https://github.com/Githarsh25">
    <img src="https://img.shields.io/badge/GitHub-Githarsh25-181717?style=for-the-badge&logo=github" alt="GitHub" />
  </a>
</p>
