import Link from "next/link";

// Hexagon (chemistry) holding an "A" drawn as a molecule: three atoms joined by
// bonds, the top atom in brand green. Same drawing as src/app/icon.svg.
// `id` keeps the gradient id unique when several marks share a page.
export function LogoMark({ className = "logo-mark", id = "logo-grad" }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1c5b82" />
          <stop offset="1" stopColor="#0d2a3d" />
        </linearGradient>
      </defs>
      <path
        d="M20 2.5 35.2 11.25v17.5L20 37.5 4.8 28.75v-17.5Z"
        fill={`url(#${id})`}
        stroke={`url(#${id})`}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M12.6 28 20 11.2 27.4 28M15.6 21.6h8.8"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="11.2" r="3.6" fill="#3fa46a" stroke="#fff" strokeWidth="1.6" />
      <circle cx="12.6" cy="28" r="2.3" fill="#fff" />
      <circle cx="27.4" cy="28" r="2.3" fill="#fff" />
    </svg>
  );
}

export default function Logo({ href = "/", id }) {
  return (
    <Link href={href} className="logo" aria-label="ANJELAB — accueil">
      <LogoMark id={id} />
      <span>
        ANJE<span className="logo-accent">LAB</span>
        <small>Matières premières</small>
      </span>
    </Link>
  );
}
