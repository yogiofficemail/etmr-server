require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { initDb, isReady } = require("./db");
const optionsRouter = require("./routes/options");
const bookingsRouter = require("./routes/bookings");

const app = express();

// Allow one or more comma-separated origins, or all when unset.
const allowed = (process.env.CLIENT_ORIGIN || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowed.includes("*") ? true : allowed,
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req, res) => res.json({ service: "etmr-server", ok: true }));

// Health must answer even if Mongo is still connecting / down.
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, db: isReady() ? "connected" : "connecting" })
);

// Guard data routes until the DB is up, so they return 503 instead of crashing.
app.use("/api", (req, res, next) => {
  if (req.path === "/health" || isReady()) return next();
  return res.status(503).json({ error: "Database not ready" });
});

app.use("/api/options", optionsRouter);
app.use("/api/bookings", bookingsRouter);

app.use((req, res) => res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// Render requires binding to process.env.PORT on 0.0.0.0
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on port ${PORT}`);
});

initDb().catch((err) => {
  console.error("MongoDB connection failed:", err.message);
  // Retry instead of exiting, so the service (and /api/health) stays up.
  setTimeout(() => initDb().catch((e) => console.error("Retry failed:", e.message)), 10000);
});

process.on("unhandledRejection", (err) => console.error("Unhandled rejection:", err));
