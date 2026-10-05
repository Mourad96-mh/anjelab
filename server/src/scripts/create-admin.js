// Creates (or resets the password of) a dashboard account — the ONLY way to
// create one, since the API has no sign-up route.
//
// Usage (from server/):  npm run create-admin -- <email> <password> ["Name"]
import "dotenv/config";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";

const [, , email, password, name] = process.argv;

if (!email || !password) {
  console.error('Usage: npm run create-admin -- <email> <password> ["Name"]');
  process.exit(1);
}
if (password.length < 10) {
  console.error("Password too short: 10 characters minimum.");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI missing (server/.env).");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
if (existing) {
  existing.password = password; // hashed by the pre('save') hook
  if (name) existing.name = name;
  await existing.save();
  console.log(`✓ Password updated for ${existing.email}`);
} else {
  const admin = await Admin.create({ email, password, name: name || "Administrateur" });
  console.log(`✓ Account created: ${admin.email}`);
}
await mongoose.disconnect();
