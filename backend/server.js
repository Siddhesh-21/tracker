const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Cloudinary config ──────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── SQLite via Sequelize ───────────────────────────────────────────────────
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || './trades.db',
  logging: false,
});

const Trade = sequelize.define('Trade', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  ticker:      { type: DataTypes.STRING, allowNull: false },
  date:        { type: DataTypes.DATEONLY },
  setup:       { type: DataTypes.STRING },
  direction:   { type: DataTypes.ENUM('long','short'), defaultValue: 'long' },
  entry:       { type: DataTypes.FLOAT },
  exit:        { type: DataTypes.FLOAT },
  qty:         { type: DataTypes.FLOAT },
  pnl:         { type: DataTypes.FLOAT },
  outcome:     { type: DataTypes.ENUM('win','loss','breakeven'), defaultValue: 'win' },
  logic:       { type: DataTypes.TEXT },
  chartUrl:    { type: DataTypes.STRING },   // Cloudinary URL
  chartId:     { type: DataTypes.STRING },   // Cloudinary public_id
  profitUrl:   { type: DataTypes.STRING },
  profitId:    { type: DataTypes.STRING },
}, { timestamps: true });

// ── Multer (memory storage → Cloudinary) ──────────────────────────────────
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },          // 10 MB per file
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// Upload buffer to Cloudinary and return { url, public_id }
async function uploadToCloudinary(buffer, folder = 'trading-journal') {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (err, result) => err ? reject(err) : resolve({ url: result.secure_url, id: result.public_id })
    ).end(buffer);
  });
}

// Delete image from Cloudinary
async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  try { await cloudinary.uploader.destroy(publicId); } catch (_) {}
}

// ── Routes ─────────────────────────────────────────────────────────────────

// GET all trades (newest first)
app.get('/api/trades', async (req, res) => {
  try {
    const trades = await Trade.findAll({ order: [['createdAt', 'DESC']] });
    res.json(trades);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST new trade (with optional images)
app.post('/api/trades', upload.fields([
  { name: 'chartImage', maxCount: 1 },
  { name: 'profitImage', maxCount: 1 },
]), async (req, res) => {
  try {
    const data = { ...req.body };

    // Upload images if provided
    if (req.files?.chartImage?.[0]) {
      const r = await uploadToCloudinary(req.files.chartImage[0].buffer, 'trading-journal/charts');
      data.chartUrl = r.url;
      data.chartId  = r.id;
    }
    if (req.files?.profitImage?.[0]) {
      const r = await uploadToCloudinary(req.files.profitImage[0].buffer, 'trading-journal/profits');
      data.profitUrl = r.url;
      data.profitId  = r.id;
    }

    const trade = await Trade.create(data);
    res.status(201).json(trade);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE trade + its Cloudinary images
app.delete('/api/trades/:id', async (req, res) => {
  try {
    const trade = await Trade.findByPk(req.params.id);
    if (!trade) return res.status(404).json({ error: 'Trade not found' });
    await Promise.all([deleteFromCloudinary(trade.chartId), deleteFromCloudinary(trade.profitId)]);
    await trade.destroy();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET summary stats
app.get('/api/stats', async (req, res) => {
  try {
    const trades = await Trade.findAll();
    const total  = trades.length;
    const wins   = trades.filter(t => t.outcome === 'win').length;
    const pnls   = trades.map(t => t.pnl).filter(n => n != null);
    res.json({
      total,
      winRate:  total ? Math.round(wins / total * 100) : 0,
      totalPnl: pnls.reduce((a, b) => a + b, 0),
      bestTrade: pnls.length ? Math.max(...pnls) : 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Sync DB and start
sequelize.sync().then(() => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Trading Journal API running on :${PORT}`));
});
