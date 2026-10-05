import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { COMPANY } from "@/lib/company";

const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-plex", display: "swap" });

export const metadata = {
  metadataBase: new URL(COMPANY.siteUrl),
  title: {
    default: "ANJELAB — Matières premières cosmétique, détergence et textile au Maroc",
    template: "%s | ANJELAB",
  },
  description:
    "ANJELAB importe et distribue au Maroc des matières premières pour la cosmétique, la détergence et l'ennoblissement textile : enzymes, colorants, adoucissants, silicones, azurants, argiles cosmétiques, produits chimiques de base.",
  openGraph: { type: "website", locale: "fr_MA", siteName: "ANJELAB" },
  robots: { index: true, follow: true },
  // Google Search Console ownership (meta tag method)
  verification: { google: "cf06gO6uZhVeXSarfKg87my2s8FNqLnztIrXKhxNG_E" },
};

export const viewport = { themeColor: "#0d2a3d" };

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={plex.variable}>
      {/* Browser extensions (ColorZilla, Grammarly…) add attributes to <body>
          before React hydrates; this silences only those attribute mismatches. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
