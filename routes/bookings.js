const express = require("express");
const { getDb } = require("../db");

const router = express.Router();

function col() {
  return getDb().collection("bookings");
}

function toApi(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

// GET /api/bookings/next-no -> next TMR number for the form header
router.get("/next-no", async (_req, res, next) => {
  try {
    const count = await col().countDocuments();
    res.json({ tmrNo: `TMR-${33925 + count}` });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const docs = await col()
      .find({})
      .sort({ createdAt: -1, _id: -1 })
      .limit(100)
      .toArray();
    res.json(docs.map(toApi));
  } catch (err) {
    next(err);
  }
});

router.get("/counts", async (_req, res, next) => {
  try {
    const [work, done] = await Promise.all([
      col().countDocuments({ status: "BOOK" }),
      col().countDocuments({ status: "DONE" }),
    ]);
    res.json({ work, done });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.mode) return res.status(400).json({ error: "Mode is required" });
    if (!body.jobNo || String(body.jobNo).length !== 5)
      return res.status(400).json({ error: "Job No must be 5 characters" });

    const count = await col().countDocuments();
    const now = new Date();

    const doc = {
      tmrNo: body.tmrNo || `TMR-${33925 + count}`,
      date: body.date || "",
      mode: body.mode || "",
      jobNoPrefix: body.jobNoPrefix || "GFS/",
      jobNo: body.jobNo || "",
      jobNoSuffix: body.jobNoSuffix || "",
      refNo: body.refNo || "",
      billTo: body.billTo || "",
      shipper: body.shipper || "",
      dateOfPickup: body.dateOfPickup || "",
      consignee: body.consignee || "",
      dateOfDropoff: body.dateOfDropoff || "",
      requestedBy: body.requestedBy || "",
      jobScope: String(body.jobScope || "").slice(0, 150),
      status: body.status || "BOOK",
      createdAt: now,
      updatedAt: now,
    };

    const result = await col().insertOne(doc);
    res.status(201).json(toApi({ _id: result.insertedId, ...doc }));
  } catch (err) {
    if (err && err.code === 11000)
      return res.status(409).json({ error: "That TMR number already exists" });
    next(err);
  }
});

module.exports = router;
