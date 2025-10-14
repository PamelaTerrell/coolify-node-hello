import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Light caching for static assets (10 minutes)
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "public, max-age=600");
  next();
});

// Serve /public
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

// Simple health check for Coolify
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// SPA fallback (keeps it future-proof if you add routes)
app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

app.listen(PORT, () => {
  console.log(`ColorQuest listening on :${PORT}`);
});
