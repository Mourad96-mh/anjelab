import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { cloudinaryConfigured } from "./services/storage.js";

for (const name of ["MONGODB_URI", "JWT_SECRET"]) {
  if (!process.env[name]) {
    console.error(`${name} is missing: cannot start (see .env.example).`);
    process.exit(1);
  }
}
if (process.env.NODE_ENV === "production" && !cloudinaryConfigured()) {
  // Local-disk uploads would vanish on the next Render deploy.
  console.warn("WARNING: CLOUDINARY_* not set — uploads go to local disk, which Render wipes on deploy.");
}

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    createApp().listen(PORT, () => console.log(`ANJELAB API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
