import dotenv from 'dotenv';
dotenv.config();

// Boot guards - catch all errors
process.on("uncaughtException", e => console.error("[FATAL] uncaughtException:", e));
process.on("unhandledRejection", e => console.error("[FATAL] unhandledRejection:", e));
console.log("[BOOT] NODE_ENV:", process.env.NODE_ENV, "SAFE_MODE:", process.env.SAFE_MODE || "0");

import express from "express";
import morgan from "morgan";
import cors from "cors";
import mongoose from 'mongoose';

// Create Express app immediately
const app = express();
app.disable("x-powered-by");
app.use(morgan(":method :url :status - :response-time ms"));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Always-on diagnostics BEFORE any DB/SMTP connections:
app.get("/health", (_req, res) => res.json({ ok: true, time: Date.now(), safe: process.env.SAFE_MODE === "1" }));
app.get("/diag/ping", (_req, res) => res.json({ ok: true, time: Date.now() }));
app.post("/diag/echo", (req, res) => res.json({ ok: true, len: JSON.stringify(req.body||{}).length }));

// Safe Mode API routes - early 200 responses
if (process.env.SAFE_MODE === "1") {
  console.warn("[BOOT] SAFE_MODE=1 → Registering safe mode routes");
  
  app.post("/api/quizzes/:quizId/register", (req, res) => {
    console.warn("[SAFE_MODE] Early-200 for", req.originalUrl);
    res.status(200).json({ success: true, diag: "safe-mode-bypass", message: "User registered successfully (safe mode)" });
  });
  
  app.post("/api/quizzes/:quizId/finalize", (req, res) => {
    console.warn("[SAFE_MODE] Early-200 for", req.originalUrl);
    res.status(200).json({ success: true, diag: "safe-mode-bypass", message: "Quiz completed successfully (safe mode)" });
  });
}

// Start server immediately
const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log("[BOOT] API listening on", `${HOST}:${PORT}`);
});

// Port conflict detection
server.on("error", (err) => {
  console.error("[BOOT] Server error:", err?.code || err);
});

// Mongo connection with timeout (non-blocking)
async function connectMongoWithTimeout(uri, timeoutMs = 5000) {
  console.log("[BOOT] Attempting Mongo connect with timeout", timeoutMs, "ms");
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMs,
      socketTimeoutMS: timeoutMs,
      heartbeatFrequencyMS: 1000,
    });
    console.log("[BOOT] Mongo connected:", mongoose.connection.host);
    clearTimeout(t);
    return true;
  } catch (e) {
    console.error("[BOOT] Mongo connect FAILED:", e?.message || e);
    clearTimeout(t);
    return false;
  }
}

// Defer Mongo connection (non-blocking)
(async () => {
  if (process.env.SAFE_MODE === "1") {
    console.warn("[BOOT] SAFE_MODE=1 → Skipping Mongo/SMTP init");
    return;
  }
  
  if (!process.env.MONGO_URI_SOURCE) {
    console.error("[BOOT] MONGO_URI_SOURCE not set");
  } else {
    await connectMongoWithTimeout(process.env.MONGO_URI_SOURCE, 5000);
  }
})();

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`[BOOT] Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    console.log('[BOOT] HTTP server closed');
    mongoose.connection.close();
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
