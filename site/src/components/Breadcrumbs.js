import Link from "next/link";
import JsonLd from "./JsonLd";
import { COMPANY } from "@/lib/company";

// Visible breadcrumb + matching BreadcrumbList JSON-LD.
export default function Breadcrumbs({ items }) {
  const all = [{ href: "/", label: "Accueil" }, ...items];
  return (
    <nav className="breadcrumbs" aria-label="Fil d'Ariane">
      <ol>
        {all.map((item, i) =>
          i === all.length - 1 ? (
            <li key={item.label} aria-current="page">
              {item.label}
            </li>
          ) : (
            <li key={item.label}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          )
        )}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            ...(item.href ? { item: `${COMPANY.siteUrl}${item.href}` } : {}),
          })),
        }}
      />
    </nav>
  );
}
