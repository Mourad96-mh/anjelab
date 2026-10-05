import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server mode (NOT `output: "export"`): pages are ISR-cached and purged on
  // demand by the API, so a product added in /admin is online in seconds.
  // See docs/ARCHITECTURE.md, ADR-2.
  trailingSlash: true,
  // The Bureau folder is itself a git repo with its own package-lock.json;
  // pin the tracing root to this project.
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
