import { COMPANY } from "@/lib/company";

export const dynamic = "force-static";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] }],
    sitemap: `${COMPANY.siteUrl}/sitemap.xml`,
  };
}
