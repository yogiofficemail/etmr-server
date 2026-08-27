require("dotenv").config();

const { initDb, getDb, closePool } = require("./db");

const modes = [
  "TRUCKING LOCAL",
  "TRUCKING IMPORT",
  "TRUCKING EXPORT",
  "TRUCKING BONDED",
  "TRANSLOADING",
  "STORAGE",
  "SHIPPING",
  "SEA IMPORT",
  "SEA EXPORT",
  "HAULAGE R/T IMPORT",
  "HAULAGE R/T EXPORT",
  "HAULAGE",
  "DOCUMENT HANDLING",
  "CONVENTIONAL IMPORT",
  "CONVENTIONAL EXPORT",
];

const billTo = [
  "SOLAR ALERT SDN BHD (HQ)",
  "SOLAR - TIX SDN BHD",
  "SOLAR ALERT SDN BHD (KSB)",
  "SOLAR OIL TOOLS SDN BHD",
  "EN BOB (EN KHIR-SOLAR ALERT)",
  "SOLAR ALERT (TKY)",
  "SOLAR ALERT OIL TOOLS (SARAWAK) SDN BHD",
];

const shippers = [
  "SOLAR FACTORY",
  "SOLAR YARD",
  "SOLAR KSB",
  "SOLAR TELOK KALONG",
  "SOLAR YARD JALAN KEBUN",
  "SOLAR LABUAN",
  "SOLAR MIRI",
  "SOLAR BINTULU",
  "SOLAR TELOK KALONG & SOLAR KSB",
  "SOLAR FACTORY AND SOLAR YARD",
  "SOLAR KOTA KINABALU",
  "PT. SOLAR ALERT ENERGY, JAKARTA",
  "HHA TELUK KALONG & SOLAR KSB",
  "LOBBY SOLAR ALERT",
];

const requestedBy = ["EN KHIR", "MR TAN", "SITI", "AZMAN", "OPERATION DEPT", "ADMIN"];

const rows = [
  ...modes.map((label) => ({ type: "mode", label })),
  ...billTo.map((label) => ({ type: "billTo", label })),
  ...shippers.map((label) => ({ type: "shipper", label })),
  ...shippers.map((label) => ({ type: "consignee", label })),
  ...requestedBy.map((label) => ({ type: "requestedBy", label })),
].map((r) => ({ ...r, value: r.label, active: 1 }));

(async () => {
  try {
    await initDb();
    const options = getDb().collection("options");

    await options.deleteMany({});
    await options.insertMany(rows);

    console.log(`Seeded ${rows.length} dropdown options`);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
})();
