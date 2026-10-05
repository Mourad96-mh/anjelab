import { Router } from "express";
import auth from "../middleware/auth.js";
import { receiveImage, receiveDocument } from "../middleware/upload.js";
import { saveFile } from "../services/storage.js";

const router = Router();

// The public URL of this API, used to build links to locally stored files.
const publicBaseUrl = (req) => process.env.PUBLIC_API_URL || `${req.protocol}://${req.get("host")}`;

function handler(kind) {
  return async (req, res, next) => {
    try {
      if (!req.file) return res.status(422).json({ message: "Aucun fichier reçu." });
      const saved = await saveFile(req.file, { kind, publicBaseUrl: publicBaseUrl(req) });
      return res.status(201).json({ ...saved, name: req.file.originalname, size: req.file.size });
    } catch (err) {
      return next(err);
    }
  };
}

router.post("/image", auth, receiveImage, handler("image"));
router.post("/document", auth, receiveDocument, handler("document"));

export default router;
