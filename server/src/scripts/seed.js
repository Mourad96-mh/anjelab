// Usage (from server/):  npm run seed          -> add missing seed products
//                        npm run seed -- --reset -> WIPE products+categories first
import "dotenv/config";
import mongoose from "mongoose";
import { seedCatalogue } from "./seed-data.js";

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI missing (server/.env).");
  process.exit(1);
}

const reset = process.argv.includes("--reset");
await mongoose.connect(process.env.MONGODB_URI);
const result = await seedCatalogue({ reset });
console.log(`✓ ${result.categories} categories, ${result.products} products in seed file, ${result.created} newly created${reset ? " (after reset)" : ""}.`);
await mongoose.disconnect();
