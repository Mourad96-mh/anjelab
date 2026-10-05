import { Router } from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Lead from "../models/Lead.js";
import auth from "../middleware/auth.js";
import { SECTORS } from "../config/sectors.js";

const router = Router();

// GET /api/catalogue — the whole published catalogue in ONE request.
// The site uses it for the sitemap, the menus and the build-time snapshot
// (site/scripts/sync-catalogue.mjs). A few hundred products stay well under
// 1 MB, so there is no need to paginate.
router.get("/catalogue", async (req, res, next) => {
  try {
    const [categories, products] = await Promise.all([
      Category.find().sort({ sector: 1, order: 1, name: 1 }).lean(),
      Product.find({ published: true })
        .sort({ order: 1, name: 1 })
        .populate("category", "name slug sector")
        .lean(),
    ]);
    res.set("Cache-Control", "public, max-age=60");
    res.json({ sectors: SECTORS, categories, products, generatedAt: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

// Dashboard home figures.
router.get("/stats", auth, async (req, res, next) => {
  try {
    const [products, drafts, categories, leads, unread] = await Promise.all([
      Product.countDocuments({ published: true }),
      Product.countDocuments({ published: false }),
      Category.countDocuments(),
      Lead.countDocuments(),
      Lead.countDocuments({ status: "nouveau" }),
    ]);
    const latestLeads = await Lead.find().sort({ createdAt: -1 }).limit(5).select("name company type status createdAt items").lean();
    res.json({ products, drafts, categories, leads, unread, latestLeads });
  } catch (err) {
    next(err);
  }
});

export default router;
