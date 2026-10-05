import mongoose from "mongoose";
import { SECTOR_SLUGS } from "../config/sectors.js";

// A catalogue entry. ANJELAB sells B2B on quotation, so there is deliberately
// NO price or stock field: every product page ends with "Demander un devis".
//
// `sectors` is an array because base chemicals (EDTA, citric acid...) serve
// textile, detergents and cosmetics at once; `category` stays single so the
// breadcrumb is unambiguous.

const FileSchema = new mongoose.Schema(
  { url: { type: String, required: true }, publicId: String, alt: String },
  { _id: false }
);

const DocumentSchema = new mongoose.Schema(
  {
    // "Fiche technique", "Fiche de données de sécurité (FDS)"...
    label: { type: String, required: true, trim: true, maxlength: 120 },
    url: { type: String, required: true },
    publicId: String,
  },
  { _id: false }
);

const SpecSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 80 },
    value: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Le nom est obligatoire."], trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    sectors: {
      type: [{ type: String, enum: SECTOR_SLUGS }],
      validate: [(v) => v.length > 0, "Au moins un secteur est requis."],
      index: true,
    },

    shortDescription: { type: String, trim: true, maxlength: 300, default: "" },
    description: { type: String, trim: true, maxlength: 5000, default: "" },
    applications: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    // Free-form technical table: Nature chimique, Forme, CAS, Conditionnement...
    specs: { type: [SpecSchema], default: [] },

    images: { type: [FileSchema], default: [] },
    documents: { type: [DocumentSchema], default: [] },

    seo: {
      title: { type: String, trim: true, maxlength: 70 },
      description: { type: String, trim: true, maxlength: 170 },
      keywords: { type: [String], default: [] },
    },

    featured: { type: Boolean, default: false, index: true },
    // Drafts stay invisible on the public site and API.
    published: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

ProductSchema.index({ name: "text", shortDescription: "text", description: "text" });
ProductSchema.index({ published: 1, order: 1, name: 1 });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
