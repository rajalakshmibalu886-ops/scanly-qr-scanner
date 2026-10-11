const express = require("express");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const app = express();
const port = process.env.PORT || 3000;
const dataDir = process.env.DATA_DIR || path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "scanly.sqlite");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);
const listScans = db.prepare("SELECT id, content, created_at FROM scans ORDER BY id DESC LIMIT 100");
const insertScan = db.prepare("INSERT INTO scans (content) VALUES (?)");
const clearScans = db.prepare("DELETE FROM scans");

app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, database: "sqlite" });
});
app.get("/api/scans", (_req, res) => {
  try { res.json(listScans.all()); }
  catch (err) { console.error(err); res.status(500).json({ error: "Could not load scans" }); }
});
app.post("/api/scans", (req, res) => {
  const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
  if (!content) return res.status(400).json({ error: "content is required" });
  if (content.length > 10000) return res.status(413).json({ error: "content is too long" });
  try {
    const result = insertScan.run(content);
    const saved = db.prepare("SELECT id, content, created_at FROM scans WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(saved);
  } catch (err) { console.error(err); res.status(500).json({ error: "Could not save scan" }); }
});
app.delete("/api/scans", (_req, res) => {
  try { clearScans.run(); res.json({ ok: true }); }
  catch (err) { console.error(err); res.status(500).json({ error: "Could not clear scans" }); }
});
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "API route not found" });
  res.sendFile(path.join(__dirname, "public", "index.html"), err => { if (err) next(err); });
});
app.listen(port, "0.0.0.0", () => console.log(`Scanly listening on port ${port}; SQLite: ${dbPath}`));
