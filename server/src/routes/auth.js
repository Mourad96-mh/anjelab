import { Router } from "express";
import { z } from "zod";
import Admin from "../models/Admin.js";
import auth, { signToken } from "../middleware/auth.js";
import rateLimit from "../middleware/rateLimit.js";
import validate from "../middleware/validate.js";
import { loginSchema } from "../validation.js";

const router = Router();

// NO sign-up route, on purpose: accounts are created with `npm run create-admin`.

router.post(
  "/login",
  rateLimit({ windowMs: 10 * 60 * 1000, max: 10, message: "Trop de tentatives. Réessayez dans quelques minutes." }),
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const admin = await Admin.findOne({ email: req.body.email }).select("+password");
      // Same answer whether the account exists or not (no e-mail enumeration).
      if (!admin || !(await admin.checkPassword(req.body.password))) {
        return res.status(401).json({ message: "E-mail ou mot de passe incorrect." });
      }
      admin.lastLoginAt = new Date();
      await admin.save();
      return res.json({ token: signToken(admin), admin: { email: admin.email, name: admin.name } });
    } catch (err) {
      return next(err);
    }
  }
);

router.get("/me", auth, async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.sub).lean();
    if (!admin) return res.status(401).json({ message: "Compte introuvable." });
    return res.json({ email: admin.email, name: admin.name });
  } catch (err) {
    return next(err);
  }
});

router.put(
  "/password",
  auth,
  validate(
    z.object({
      currentPassword: z.string().min(1, "Mot de passe actuel requis."),
      newPassword: z.string().min(10, "10 caractères minimum."),
    })
  ),
  async (req, res, next) => {
    try {
      const admin = await Admin.findById(req.admin.sub).select("+password");
      if (!admin || !(await admin.checkPassword(req.body.currentPassword))) {
        return res.status(401).json({ message: "Mot de passe actuel incorrect." });
      }
      admin.password = req.body.newPassword;
      await admin.save();
      return res.json({ ok: true });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
