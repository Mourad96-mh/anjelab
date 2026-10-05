import { Router } from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import auth, { optionalAuth } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { productSchema } from "../validation.js";
import { uniqueSlug } from "../utils/slugify.js";
import { deleteFile } from "../services/storage.js";
import { revalidateSite } from "../services/revalidate.js";
import { SECTOR_SLUGS } from "../config/sectors.js";

const router = Router();

const CATEGORY_FIELDS = "name slug sector";
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Drafts are visible only to a logged-in admin who asks for them (?all=1).
const canSeeDrafts = (req) => Boolean(req.admin) && req.query.all === "1";

// GET /api/products?sector=&category=<slug>&q=&featured=1&page=&limit=
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const filter = canSeeDrafts(req) ? {} : { published: true };
    if (SECTOR_SLUGS.includes(req.query.sector)) filter.sectors = req.query.sector;
    if (req.query.featured === "1") filter.featured = true;
    if (typeof req.query.category === "string" && req.query.category) {
      const category = await Category.findOne({ slug: req.query.category }).select("_id").lean();
      if (!category) return res.json({ items: [], total: 0, page: 1, pages: 0 });
      filter.category = category._id;
    }
    if (typeof req.query.q === "string" && req.query.q.trim()) {
      // A regex rather than $text: it matches partial words ("silic" ->
      // "silicone"), which is what people type in a search box. The catalogue
      // stays small (hundreds of rows), so the scan is cheap.
      const rx = new RegExp(escapeRegex(req.query.q.trim().slice(0, 80)), "i");
      filter.$or = [{ name: rx }, { shortDescription: rx }, { "seo.keywords": rx }];
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 200, 1), 500);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort({ order: 1, name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("category", CATEGORY_FIELDS)
        .lean(),
      Product.countDocuments(filter),
    ]);
    return res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    return next(err);
  }
});

// Dashboard edit form loads by id (the slug may be edited in that form).
router.get("/id/:id", auth, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", CATEGORY_FIELDS).lean();
    if (!product) return res.status(404).json({ message: "Produit introuvable." });
    return res.json(product);
  } catch (err) {
    return next(err);
  }
});

// Public product page: the product + up to 4 related ones from its category.
router.get("/:slug", optionalAuth, async (req, res, next) => {
  try {
    const filter = { slug: req.params.slug };
    if (!req.admin) filter.published = true;
    const product = await Product.findOne(filter).populate("category", CATEGORY_FIELDS).lean();
    if (!product) return res.status(404).json({ message: "Produit introuvable." });

    const related = await Product.find({
      _id: { $ne: product._id },
      category: product.category?._id,
      published: true,
    })
      .sort({ order: 1, name: 1 })
      .limit(4)
      .select("name slug shortDescription images category")
      .populate("category", CATEGORY_FIELDS)
      .lean();
    return res.json({ ...product, related });
  } catch (err) {
    return next(err);
  }
});

async function assertCategory(id) {
  const category = await Category.findById(id).lean();
  if (!category) {
    const err = new Error("Catégorie inconnue.");
    err.status = 422;
    throw err;
  }
  return category;
}

const pathsFor = (product, categorySlug) => ["/", "/produits", `/produits/${categorySlug}`, `/produit/${product.slug}`];

router.post("/", auth, validate(productSchema), async (req, res, next) => {
  try {
    const category = await assertCategory(req.body.category);
    const slug = await uniqueSlug(Product, req.body.slug || req.body.name);
    const product = await Product.create({ ...req.body, slug });
    revalidateSite(pathsFor(product, category.slug));
    return res.status(201).json(product);
  } catch (err) {
    if (err.status === 422) return res.status(422).json({ message: err.message, errors: { category: err.message } });
    return next(err);
  }
});

router.put("/:id", auth, validate(productSchema), async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id).populate("category", "slug");
    if (!existing) return res.status(404).json({ message: "Produit introuvable." });
    const category = await assertCategory(req.body.category);

    const before = { slug: existing.slug, categorySlug: existing.category?.slug };
    const keptIds = new Set([...req.body.images, ...req.body.documents].map((f) => f.publicId).filter(Boolean));
    const removed = [...existing.images, ...existing.documents]
      .map((f) => f.publicId)
      .filter((id) => id && !keptIds.has(id));

    const slug = await uniqueSlug(Product, req.body.slug || existing.slug, existing._id);
    existing.set({ ...req.body, slug });
    await existing.save();

    // Only after the save succeeded: never delete a file still referenced.
    await Promise.all(removed.map(deleteFile));

    revalidateSite([...pathsFor(existing, category.slug), `/produit/${before.slug}`, `/produits/${before.categorySlug}`]);
    return res.json(existing);
  } catch (err) {
    if (err.status === 422) return res.status(422).json({ message: err.message, errors: { category: err.message } });
    return next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id).populate("category", "slug");
    if (!product) return res.status(404).json({ message: "Produit introuvable." });
    await Promise.all([...product.images, ...product.documents].map((f) => deleteFile(f.publicId)));
    revalidateSite(pathsFor(product, product.category?.slug));
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
