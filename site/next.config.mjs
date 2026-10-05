import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `next build` writes plain HTML to out/, uploaded to
  // Hostinger shared hosting (no Node.js there). The catalogue is read from
  // the API at build time, so a change made in /admin goes online at the next
  // build + upload. Headers (noindex on /admin, cache) live in public/.htaccess.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // The Bureau folder is itself a git repo with its own package-lock.json;
  // pin the tracing root to this project.
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
};

export default nextConfig;
