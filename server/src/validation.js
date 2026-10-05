import { z } from "zod";
import { SECTOR_SLUGS } from "./config/sectors.js";

// Request-body schemas. Everything the API writes to MongoDB goes through one
// of these: unknown keys are stripped, strings trimmed, lengths capped.

const text = (max, msg) => z.string({ invalid_type_error: msg }).trim().max(max, `${max} caractères maximum.`);
const required = (max, msg) => text(max, msg).min(1, msg);
const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "Identifiant invalide.");
const sector = z.enum(SECTOR_SLUGS, { errorMap: () => ({ message: "Secteur inconnu." }) });
const lines = z.array(text(300)).max(20).transform((a) => a.filter(Boolean)).default([]);
// Absolute URL (Cloudinary, API uploads) or a site-relative path such as
// "/images/products/edta.webp" (illustrations shipped with the website).
const fileUrl = z
  .string()
  .max(1000)
  .refine((v) => /^https?:\/\//.test(v) || /^\/[\w./-]+$/.test(v), "URL de fichier invalide.");
const file = z.object({ url: fileUrl, publicId: text(300).optional(), alt: text(200).optional() });

export const categorySchema = z.object({
  name: required(120, "Le nom est obligatoire."),
  slug: text(80).optional(),
  sector,
  description: text(1000).default(""),
  image: file.partial().nullable().optional(),
  order: z.coerce.number().int().min(0).max(9999).default(0),
});

export const productSchema = z.object({
  name: required(160, "Le nom est obligatoire."),
  slug: text(80).optional(),
  category: objectId,
  sectors: z.array(sector).min(1, "Choisissez au moins un secteur."),
  shortDescription: text(300).default(""),
  description: text(5000).default(""),
  applications: lines,
  benefits: lines,
  specs: z
    .array(z.object({ label: text(80), value: text(500) }))
    .max(30)
    .transform((a) => a.filter((s) => s.label && s.value))
    .default([]),
  images: z.array(file).max(12).default([]),
  documents: z
    .array(z.object({ label: required(120, "Libellé du document requis."), url: z.string().url().max(1000), publicId: text(300).optional() }))
    .max(10)
    .default([]),
  seo: z
    .object({
      title: text(70).optional(),
      description: text(170).optional(),
      keywords: z.array(text(60)).max(10).default([]),
    })
    .default({}),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.coerce.number().int().min(0).max(9999).default(0),
});

const phone = z
  .string({ required_error: "Le téléphone est obligatoire." })
  .trim()
  .regex(/^[\d\s+().-]{6,30}$/, "Numéro de téléphone invalide.");

export const leadSchema = z.object({
  type: z.enum(["devis", "contact"]).default("devis"),
  name: required(120, "Votre nom est obligatoire."),
  company: text(160).optional(),
  email: z.string({ required_error: "L'e-mail est obligatoire." }).trim().toLowerCase().email("Adresse e-mail invalide.").max(160),
  phone,
  city: text(80).optional(),
  sector: text(80).optional(),
  message: text(5000).default(""),
  frequency: text(80).optional(),
  wantsDatasheet: z.boolean().default(false),
  wantsSample: z.boolean().default(false),
  items: z
    .array(
      z.object({
        product: objectId.optional(),
        name: required(160, "Produit invalide."),
        slug: text(80).optional(),
        quantity: text(80).optional(),
        packaging: text(80).optional(),
      })
    )
    .max(50)
    .default([]),
  // Anti-spam signals, never stored.
  website: z.string().optional(),
  openedFor: z.coerce.number().optional(),
});

export const leadUpdateSchema = z.object({
  status: z.enum(["nouveau", "lu", "traite"]).optional(),
  note: text(2000).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "E-mail requis."),
  password: z.string().min(1, "Mot de passe requis."),
});
