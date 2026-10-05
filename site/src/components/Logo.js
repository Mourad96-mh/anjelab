import Link from "next/link";

// Provisional mark until the client sends a logo (TODO(client)): a plain
// square monogram, deliberately unornamented.
export function LogoMark({ className = "logo-mark" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <rect width="36" height="36" fill="#0d2a3d" />
      <path d="M10 26L18 9l8 17M13 20h10" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="square" />
      <rect x="0" y="32" width="36" height="4" fill="#2f7d4f" />
    </svg>
  );
}

export default function Logo({ href = "/" }) {
  return (
    <Link href={href} className="logo" aria-label="ANJELAB — accueil">
      <LogoMark />
      <span>
        ANJELAB
        <small>Matières premières</small>
      </span>
    </Link>
  );
}
