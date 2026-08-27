const express = require("express");
const { getDb } = require("../db");

const router = express.Router();

const TYPES = ["mode", "billTo", "shipper", "consignee", "requestedBy"];

function col() {
  return getDb().collection("options");
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/options?type=shipper&q=sola&limit=50
router.get("/", async (req, res, next) => {
  try {
    const { type, q = "", limit = 50 } = req.query;
    const filter = { active: { $ne: 0 } };

    if (type) {
      if (!TYPES.includes(type)) return res.status(400).json({ error: "Unknown type" });
      filter.type = type;
    }
    if (String(q).trim()) {
      filter.label = { $regex: escapeRegex(String(q).trim()), $options: "i" };
    }

    const max = Math.min(Number(limit) || 50, 200);
    const rows = await col()
      .find(filter, { projection: { _id: 0, type: 1, label: 1, value: 1 } })
      .sort({ label: 1 })
      .limit(max)
      .toArray();

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/options/all -> { mode: [...], billTo: [...], ... }
router.get("/all", async (_req, res, next) => {
  try {
    const rows = await col()
      .find({ active: { $ne: 0 } }, { projection: { _id: 0, type: 1, label: 1, value: 1 } })
      .sort({ label: 1 })
      .toArray();

    const grouped = TYPES.reduce((acc, t) => ({ ...acc, [t]: [] }), {});
    rows.forEach((d) => {
      if (!grouped[d.type]) grouped[d.type] = [];
      grouped[d.type].push({ label: d.label, value: d.value });
    });

    res.json(grouped);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
