import { Router } from "express";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { categorySchema } from "../validation.js";
import { uniqueSlug } from "../utils/slugify.js";
import { revalidateSite } from "../services/revalidate.js";
import { SECTOR_SLUGS } from "../config/sectors.js";

const router = Router();

// Published-product counts per category, in one aggregation.
async function countsByCategory(publishedOnly) {
  const match = publishedOnly ? { published: true } : {};
  const rows = await Product.aggregate([{ $match: match }, { $group: { _id: "$category", n: { $sum: 1 } } }]);
  return new Map(rows.map((r) => [String(r._id), r.n]));
}

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (SECTOR_SLUGS.includes(req.query.sector)) filter.sector = req.query.sector;
    const [categories, counts] = await Promise.all([
      Category.find(filter).sort({ sector: 1, order: 1, name: 1 }).lean(),
      countsByCategory(req.query.all !== "1"),
    ]);
    res.json({ items: categories.map((c) => ({ ...c, productCount: counts.get(String(c._id)) || 0 })) });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug }).lean();
    if (!category) return res.status(404).json({ message: "Catégorie introuvable." });
    return res.json(category);
  } catch (err) {
    return next(err);
  }
});

router.post("/", auth, validate(categorySchema), async (req, res, next) => {
  try {
    const slug = await uniqueSlug(Category, req.body.slug || req.body.name);
    const category = await Category.create({ ...req.body, slug });
    revalidateSite(["/", "/produits"]);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", auth, validate(categorySchema), async (req, res, next) => {
  try {
    const existing = await Category.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Catégorie introuvable." });
    const oldSlug = existing.slug;
    const slug = await uniqueSlug(Category, req.body.slug || existing.slug, existing._id);
    existing.set({ ...req.body, slug });
    await existing.save();
    revalidateSite(["/", "/produits", `/produits/${oldSlug}`, `/produits/${slug}`]);
    return res.json(existing);
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const used = await Product.countDocuments({ category: req.params.id });
    if (used) {
      return res.status(409).json({
        message: `Impossible de supprimer : ${used} produit${used > 1 ? "s utilisent" : " utilise"} cette catégorie. Déplacez-les d'abord.`,
      });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Catégorie introuvable." });
    revalidateSite(["/", "/produits", `/produits/${category.slug}`]);
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
