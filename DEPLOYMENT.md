# Trading Journal — Deployment Guide

## Architecture Overview

```
┌─────────────────────┐     REST API      ┌──────────────────────┐
│  Frontend (React)   │ ───────────────▶  │  Backend (Node.js)   │
│  Hosted on Vercel   │                   │  Hosted on Railway   │
└─────────────────────┘                   └──────────┬───────────┘
                                                      │
                              ┌───────────────────────┼────────────────┐
                              ▼                       ▼                │
                    ┌──────────────────┐   ┌──────────────────┐       │
                    │  SQLite Database │   │   Cloudinary CDN │       │
                    │  (trade records) │   │  (chart & P&L    │       │
                    │  lives on Railway│   │   screenshots)   │       │
                    └──────────────────┘   └──────────────────┘       │
```

---

## Step 1 — Set Up Cloudinary (Image Storage)

Cloudinary stores your chart and P&L screenshots.  
**Free tier:** 25 GB storage, 25 GB bandwidth/month — more than enough.

1. Go to **[cloudinary.com](https://cloudinary.com)** → Sign up for free
2. After logging in, go to **Dashboard**
3. Copy these three values — you'll need them later:
   - `Cloud name` du1rtz5nd
   - `API Key` 793798779615863
   - `API Secret` z1hYL9ahGvvcMIIruifvyOON5-g

---

## Step 2 — Push Code to GitHub

Both the frontend and backend need to be in separate GitHub repos  
(or in one monorepo — Railway and Vercel both support subdirectory deploys).

```bash
# From the project root
git init
git add .
git commit -m "Initial commit — Trading Journal"
git remote add origin https://github.com/YOUR_USERNAME/trading-journal.git
git push -u origin main
```

---

## Step 3 — Deploy Backend on Railway

Railway gives you a free SQLite-backed server with persistent disk.

### 3a. Create Railway project

1. Go to **[railway.app](https://railway.app)** → Log in with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select your repo and set **Root Directory** to `backend`
4. Railway auto-detects Node.js and runs `npm start`

### 3b. Add environment variables in Railway

Go to your service → **Variables** tab → add these one by one:

| Variable | Value |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | your cloud name from Step 1 |
| `CLOUDINARY_API_KEY` | your API key from Step 1 |
| `CLOUDINARY_API_SECRET` | your API secret from Step 1 |
| `DB_PATH` | `/app/data/trades.db` |
| `PORT` | `4000` |

### 3c. Add a persistent volume for SQLite

1. In Railway → **Volumes** tab → **Add Volume**
2. Mount path: `/app/data`
3. This ensures `trades.db` persists across redeploys (SQLite data is not lost)

### 3d. Get your backend URL

After deploy, Railway shows a URL like:  
`https://trading-journal-production.up.railway.app`

Copy this — you need it for the frontend.

---

## Step 4 — Deploy Frontend on Vercel

1. Go to **[vercel.com](https://vercel.com)** → Log in with GitHub
2. Click **Add New → Project** → import your repo
3. Set **Root Directory** to `frontend`
4. Framework preset: **Vite**
5. Under **Environment Variables**, add:

| Variable | Value |
|---|---|
| `VITE_API_URL` | your Railway URL from Step 3d (no trailing slash) |

6. Click **Deploy**

Vercel gives you a live URL like:  
`https://trading-journal.vercel.app`

---

## Step 5 — Fix CORS (allow your Vercel domain)

In `backend/server.js`, update the `cors()` call to whitelist your Vercel URL:

```js
app.use(cors({
  origin: [
    "http://localhost:5173",                        // local dev
    "https://trading-journal.vercel.app",           // your Vercel URL
  ],
}));
```

Commit and push — Railway redeploys automatically.

---

## Local Development

```bash
# Terminal 1 — backend
cd backend
cp .env.example .env       # fill in your Cloudinary keys
npm install
npm run dev                # runs on http://localhost:4000

# Terminal 2 — frontend
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:4000
npm install
npm run dev                # runs on http://localhost:5173
```

---

## Data Storage Summary

| Data | Where | How |
|---|---|---|
| Trade records (ticker, P&L, dates, logic…) | SQLite on Railway persistent volume | `trades.db` on `/app/data` mount |
| Chart screenshots | Cloudinary CDN | Uploaded via Multer → Cloudinary upload stream |
| P&L screenshots | Cloudinary CDN | Same as above, separate folder |

### What happens when you add a trade

```
User submits form
       │
       ▼
Frontend: FormData (fields + 2 image files)
       │
       ▼  POST /api/trades  (multipart/form-data)
       │
       ▼
Backend: multer reads files into memory buffers
       │
       ├─▶ Cloudinary upload (chart)  → returns URL + public_id
       ├─▶ Cloudinary upload (profit) → returns URL + public_id
       │
       ▼
SQLite: INSERT INTO Trades (ticker, pnl, chartUrl, profitUrl, …)
       │
       ▼
Frontend receives saved trade with Cloudinary image URLs
```

---

## Cost Summary (all free tiers)

| Service | Free Limit | What it covers |
|---|---|---|
| Vercel | Unlimited static deploys | Frontend hosting |
| Railway | $5/month credit (≈500 hr) | Backend + SQLite |
| Cloudinary | 25 GB storage + 25 GB bandwidth | All trade images |

Railway's free credit resets monthly and covers ~24/7 uptime for one service.  
For heavy use, upgrade Railway to the $5/month Hobby plan for guaranteed uptime.

---

## Upgrading Storage (optional, later)

When you outgrow SQLite or want multi-device sync:

- **Database:** Replace SQLite with **PostgreSQL** (Railway has a free Postgres addon)
  - Change `dialect: 'sqlite'` → `dialect: 'postgres'` in `server.js`
  - Add `pg` package: `npm install pg`
- **Images:** Cloudinary free tier is generous; paid starts at $89/month for 225 GB
