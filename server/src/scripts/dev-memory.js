// Zero-setup local API: an in-memory MongoDB, seeded with the catalogue and a
// demo admin. Nothing is persisted — stop the process and the data is gone.
// For real work, set MONGODB_URI to an Atlas cluster and use `npm run dev`.
//
//   npm run dev:memory   ->  http://localhost:4000   admin@anjelab.ma / anjelab-demo-2026
import "dotenv/config";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../app.js";
import Admin from "../models/Admin.js";
import { seedCatalogue } from "./seed-data.js";

const mongo = await MongoMemoryServer.create();
await mongoose.connect(mongo.getUri());

process.env.JWT_SECRET ||= "dev-only-secret-change-me";
const result = await seedCatalogue();
await Admin.create({ email: "admin@anjelab.ma", password: "anjelab-demo-2026", name: "Admin démo" });

const PORT = process.env.PORT || 4000;
createApp().listen(PORT, () => {
  console.log(`ANJELAB API (in-memory DB) on http://localhost:${PORT}`);
  console.log(`  seeded ${result.created} products — login admin@anjelab.ma / anjelab-demo-2026`);
});

const stop = async () => {
  await mongoose.disconnect();
  await mongo.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
