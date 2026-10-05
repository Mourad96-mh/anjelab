import multer from "multer";

// Files are received IN MEMORY and only pass through: Render's disk is
// ephemeral, so they are pushed to Cloudinary (or to ./uploads in local dev,
// see services/storage.js).

const MB = 1024 * 1024;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const DOCUMENT_TYPES = ["application/pdf"];

function only(types, label) {
  return (req, file, cb) =>
    types.includes(file.mimetype) ? cb(null, true) : cb(new Error(`Format non accepté. Formats autorisés : ${label}.`));
}

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * MB, files: 1 },
  fileFilter: only(IMAGE_TYPES, "JPG, PNG, WebP, AVIF"),
});

// Technical data sheets and safety data sheets (FT / FDS).
const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * MB, files: 1 },
  fileFilter: only(DOCUMENT_TYPES, "PDF"),
});

// Wraps multer so its errors become clean 400 JSON responses.
function wrap(mw, maxLabel) {
  return (req, res, next) =>
    mw(req, res, (err) => {
      if (!err) return next();
      const message = err.code === "LIMIT_FILE_SIZE" ? `Fichier trop volumineux (${maxLabel} maximum).` : err.message;
      return res.status(400).json({ message });
    });
}

export const receiveImage = wrap(imageUpload.single("file"), "10 Mo");
export const receiveDocument = wrap(documentUpload.single("file"), "15 Mo");
