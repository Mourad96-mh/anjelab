import { Router } from "express";
import Lead from "../models/Lead.js";
import auth from "../middleware/auth.js";
import rateLimit from "../middleware/rateLimit.js";
import validate from "../middleware/validate.js";
import { leadSchema, leadUpdateSchema } from "../validation.js";

const router = Router();

// Three non-blocking defences against bots:
//   1. honeypot field `website`, invisible to humans;
//   2. minimum fill time (a human does not fill 8 fields in 2 s);
//   3. per-IP rate limit.
const MIN_FILL_MS = 2500;

router.post("/", rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), validate(leadSchema), async (req, res, next) => {
  try {
    const { website, openedFor, ...data } = req.body;
    // 200 on purpose: a bot that believes it succeeded moves on.
    if (website) return res.status(200).json({ ok: true });
    if (openedFor && openedFor < MIN_FILL_MS) {
      return res.status(400).json({ message: "Formulaire envoyé trop rapidement, merci de réessayer." });
    }
    if (data.type === "devis" && !data.items.length && !data.message) {
      return res.status(422).json({
        message: "Ajoutez au moins un produit ou décrivez votre besoin.",
        errors: { message: "Ajoutez au moins un produit ou décrivez votre besoin." },
      });
    }
    await Lead.create({
      ...data,
      ip: req.clientIp || req.ip,
      userAgent: (req.headers["user-agent"] || "").slice(0, 300),
    });
    return res.status(201).json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

router.get("/", auth, async (req, res, next) => {
  try {
    const filter = {};
    if (["nouveau", "lu", "traite"].includes(req.query.status)) filter.status = req.query.status;
    const [items, unread] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).limit(500).select("-ip -userAgent").lean(),
      Lead.countDocuments({ status: "nouveau" }),
    ]);
    res.json({ items, unread });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", auth, validate(leadUpdateSchema), async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-ip -userAgent").lean();
    if (!lead) return res.status(404).json({ message: "Demande introuvable." });
    return res.json(lead);
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: "Demande introuvable." });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
