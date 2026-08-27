require("dotenv").config();

const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DATABASE || "etmr";

let client;
let db;

async function initDb() {
  if (db) return db;

  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 15000,
  });

  await client.connect();
  db = client.db(dbName);

  // Indexes (safe to run repeatedly)
  await db.collection("bookings").createIndex({ tmrNo: 1 }, { unique: true });
  await db.collection("bookings").createIndex({ createdAt: -1 });
  await db.collection("bookings").createIndex({ status: 1 });
  await db.collection("options").createIndex({ type: 1, value: 1 }, { unique: true });
  await db.collection("options").createIndex({ label: 1 });

  console.log("MongoDB connected:", dbName);
  return db;
}

function getDb() {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}

function isReady() {
  return Boolean(db);
}

async function closePool() {
  if (client) await client.close();
  client = undefined;
  db = undefined;
}

module.exports = { initDb, getDb, isReady, closePool };
