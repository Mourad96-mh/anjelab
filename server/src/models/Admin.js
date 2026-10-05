import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Dashboard account. There is no public sign-up: accounts are created from the
// command line (npm run create-admin), so login is the only exposed surface.

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    // bcrypt hash, never returned unless explicitly selected.
    password: { type: String, required: true, select: false },
    name: { type: String, trim: true, default: "Administrateur" },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

AdminSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

AdminSchema.methods.checkPassword = function checkPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
