# Trading Journal v2 — Frontend Setup & Deployment Guide

## Project Structure

```
trading-journal-v2/
├── index.html
├── vite.config.js
├── package.json
├── .env.example
└── src/
    ├── main.jsx          ← React entry point
    ├── App.jsx           ← Router + page wiring
    ├── api.js            ← All API calls + helpers
    ├── index.css         ← Global design tokens + reset
    ├── components/
    │   ├── Layout.jsx    ← Sidebar navigation
    │   └── UI.jsx        ← Shared components (Card, Badge, etc.)
    └── pages/
        ├── Dashboard.jsx   ← Stats, equity curve, charts
        ├── AddTrade.jsx    ← Trade entry form
        ├── TradeLog.jsx    ← Filterable/sortable trade list
        ├── TradeDetail.jsx ← Single trade deep-dive
        ├── Calendar.jsx    ← Monthly P&L heatmap
        └── Playbook.jsx    ← Rules, quotes, checklist
```

---

## Pages Overview

| Route          | Page         | Description |
|----------------|--------------|-------------|
| `/`            | Dashboard    | KPI cards, equity curve, daily P&L bar, outcome pie, top setups, recent trades |
| `/add`         | Add Trade    | Full form — ticker, direction, entry/exit/qty, auto P&L, logic, emotion, tags, 2 image uploads |
| `/trades`      | Trade Log    | Table + card view, filter by outcome/direction, search, sort by date/P&L |
| `/trades/:id`  | Trade Detail | Full single trade — hero P&L card, metrics, logic, psychology, screenshots with lightbox |
| `/calendar`    | Calendar     | Monthly heatmap grid with daily P&L, yearly mini overview, click-to-drill-down |
| `/playbook`    | Playbook     | Rotating motivational quotes, editable trading rules by category, pre-session checklist, session notes |

---

## Local Development

### Prerequisites
- Node.js 18+
- The backend from Part 1 running on `http://localhost:4000`

### Steps

```bash
# 1. Enter the frontend folder
cd trading-journal-v2

# 2. Install dependencies
npm install

# 3. Copy env file (leave VITE_API_URL blank for local — Vite proxies to :4000)
cp .env.example .env

# 4. Start dev server
npm run dev
# → Opens at http://localhost:5173
```

The `vite.config.js` already proxies `/api/*` to `http://localhost:4000` in dev,
so you don't need to set `VITE_API_URL` locally.

---

## Deploy to Vercel (Production)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: trading journal v2 frontend"
git remote add origin https://github.com/YOUR_USERNAME/trading-journal-frontend.git
git push -u origin main
```

### Step 2 — Import into Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Framework preset: **Vite** (auto-detected)
4. Root directory: `trading-journal-v2` (or `.` if it's the repo root)

### Step 3 — Set Environment Variable

In Vercel project settings → **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend.railway.app` |

> Get this URL from your Railway backend deployment (Part 1 of this project).

### Step 4 — Deploy

Click **Deploy**. Vercel gives you a URL like:
`https://trading-journal-abc123.vercel.app`

---

## Fix CORS on the Backend

After deploying the frontend, update `backend/server.js` to allow your Vercel domain:

```js
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://trading-journal-abc123.vercel.app",  // ← your Vercel URL
  ],
}));
```

Commit and push → Railway redeploys automatically.

---

## Notes on the Playbook page

The Playbook's **trading rules** and **session notes** are saved to `localStorage`
(browser storage), so they persist between sessions on the same browser without
needing the backend. If you want them synced across devices, you can add a
`/api/playbook` endpoint to the backend later.

---

## Dependencies Used

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI framework |
| `react-router-dom` v6 | Client-side routing |
| `recharts` | Charts (equity curve, bar, pie) |
| `vite` + `@vitejs/plugin-react` | Build tool |

No UI component library — everything is hand-crafted with CSS variables for the dark terminal aesthetic.
