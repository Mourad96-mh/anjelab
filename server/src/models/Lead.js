import mongoose from "mongoose";

// A quote / contact request sent from the website. Stored and read in the
// dashboard; no e-mail is sent (no SMTP to manage, nothing gets lost in spam).

const LeadItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    // Snapshot of the name: the request stays readable even if the product is
    // renamed or deleted later.
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    quantity: { type: String, trim: true, maxlength: 80 },
    packaging: { type: String, trim: true, maxlength: 80 },
  },
  { _id: false }
);

const LeadSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["devis", "contact"], default: "devis", index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    company: { type: String, trim: true, maxlength: 160 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    city: { type: String, trim: true, maxlength: 80 },
    sector: { type: String, trim: true, maxlength: 80 },
    message: { type: String, trim: true, maxlength: 5000, default: "" },
    items: { type: [LeadItemSchema], default: [] },
    // "ponctuelle", "mensuelle"... helps the sales team qualify the request.
    frequency: { type: String, trim: true, maxlength: 80 },
    wantsDatasheet: { type: Boolean, default: false },
    wantsSample: { type: Boolean, default: false },

    status: { type: String, enum: ["nouveau", "lu", "traite"], default: "nouveau", index: true },
    note: { type: String, trim: true, maxlength: 2000, default: "" },

    // Anti-abuse traces, never shown publicly.
    ip: String,
    userAgent: String,
  },
  { timestamps: true, versionKey: false }
);

LeadSchema.index({ createdAt: -1 });

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
