import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import productRoutes from "./routes/products.js";
import leadRoutes from "./routes/leads.js";
import uploadRoutes from "./routes/uploads.js";
import catalogueRoutes from "./routes/catalogue.js";
import { UPLOAD_DIR } from "./services/storage.js";
import { notFound, errorHandler } from "./middleware/errors.js";

// Builds the Express app WITHOUT listening, so tests can drive it with
// supertest against an in-memory MongoDB.
export function createApp() {
  const app = express();

  // Render sits behind private-range proxies: trust those only, so req.ip is
  // the visitor's address and X-Forwarded-For cannot be spoofed by prefixing.
  app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);
  // Cloudflare (in front of Render) overwrites CF-Connecting-IP on every
  // request, so it is the reliable visitor IP when present.
  app.use((req, res, next) => {
    const cf = req.headers["cf-connecting-ip"];
    req.clientIp = typeof cf === "string" && cf.length <= 45 ? cf.trim() : req.ip;
    next();
  });

  // JSON API only; product images in /uploads (dev) are embedded by the site
  // on another origin, hence cross-origin resource policy.
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  // CORS_ORIGIN = comma-separated site origins. Empty = allow all (local dev).
  const allowed = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  app.use(
    cors({
      origin(origin, cb) {
        // No Origin header (curl, server-side fetch from Next.js, Render health
        // checks): no CSRF risk since auth travels in a header, not a cookie.
        if (!allowed.length || !origin || allowed.includes(origin)) return cb(null, true);
        return cb(new Error(`Origine non autorisée : ${origin}`));
      },
    })
  );

  app.use(express.json({ limit: "1mb" }));

  app.get("/", (req, res) =>
    res.json({
      service: "ANJELAB API",
      status: "ok",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    })
  );

  app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "30d", immutable: true, fallthrough: false }));

  app.use("/api/auth", authRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/leads", leadRoutes);
  app.use("/api/uploads", uploadRoutes);
  app.use("/api", catalogueRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
