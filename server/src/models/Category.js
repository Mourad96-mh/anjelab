import mongoose from "mongoose";
import { SECTOR_SLUGS } from "../config/sectors.js";

// A product family inside one sector, e.g. "Adoucissants & silicones" in
// "Ennoblissement textile". Public URL: /categories/<slug>/

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Le nom est obligatoire."], trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    sector: { type: String, required: true, enum: SECTOR_SLUGS, index: true },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    image: { url: String, publicId: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

CategorySchema.index({ sector: 1, order: 1, name: 1 });

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);
