import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";

// File storage behind one interface:
//   - Cloudinary when CLOUDINARY_* are set (production);
//   - ./uploads on local disk otherwise (development and tests only — Render's
//     disk is wiped on every deploy, so this mode must never reach production).
//
// Credentials never leave the server: the browser uploads to this API, which
// relays the file.

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "uploads");

export function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
  );
}

let configured = false;
function client() {
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

function toCloudinary(buffer, { folder, resourceType }) {
  return new Promise((resolve, reject) => {
    const stream = client().uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        ...(resourceType === "image"
          ? {
              // A phone photo is 4-8 MB; 1600px is plenty for a product page.
              transformation: [{ width: 1600, height: 1600, crop: "limit" }, { quality: "auto:good" }],
            }
          : {}),
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    Readable.from(buffer).pipe(stream);
  });
}

const EXT = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif", "application/pdf": ".pdf" };

/**
 * @param {Express.Multer.File} file
 * @param {{ kind: "image" | "document", publicBaseUrl: string }} opts
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function saveFile(file, { kind, publicBaseUrl }) {
  if (cloudinaryConfigured()) {
    const result = await toCloudinary(file.buffer, {
      folder: `anjelab/${kind === "image" ? "produits" : "documents"}`,
      resourceType: kind === "image" ? "image" : "raw",
    });
    return { url: result.secure_url, publicId: `cld:${result.resource_type}:${result.public_id}` };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}${EXT[file.mimetype] || ""}`;
  await writeFile(path.join(UPLOAD_DIR, name), file.buffer);
  return { url: `${publicBaseUrl}/uploads/${name}`, publicId: `local:${name}` };
}

// Best-effort: a failed cleanup must never fail the main request.
export async function deleteFile(publicId) {
  if (!publicId) return;
  try {
    if (publicId.startsWith("cld:")) {
      const [, resourceType, ...rest] = publicId.split(":");
      await client().uploader.destroy(rest.join(":"), { resource_type: resourceType });
    } else if (publicId.startsWith("local:")) {
      const name = path.basename(publicId.slice("local:".length));
      await unlink(path.join(UPLOAD_DIR, name));
    }
  } catch (err) {
    console.warn(`[storage] could not delete ${publicId}: ${err.message}`);
  }
}
