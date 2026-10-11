import { COMPANY } from "@/lib/company";

export const dynamic = "force-static";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${COMPANY.siteUrl}/sitemap.xml`,
  };
}
