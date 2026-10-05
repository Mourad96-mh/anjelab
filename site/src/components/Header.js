"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import Icon from "./Icon";
import { useQuote } from "./QuoteProvider";
import { COMPANY, telHref } from "@/lib/company";
import { SECTORS } from "@/lib/sectors";

const NAV = [
  { href: "/produits/", label: "Produits", mega: true },
  { href: "/secteurs/ennoblissement-textile/", label: "Textile & laverie" },
  { href: "/secteurs/detergence/", label: "Détergence" },
  { href: "/secteurs/cosmetique/", label: "Cosmétique" },
  { href: "/a-propos/", label: "Société" },
  { href: "/contact/", label: "Contact" },
];

export default function Header({ categories = [] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { items } = useQuote();

  const headerRef = useRef(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return undefined;
    // The top bar pushes the sticky header down until the page scrolls, so the
    // panel starts at the header's real bottom edge, not at a fixed offset.
    const place = () => {
      const bottom = headerRef.current?.getBoundingClientRect().bottom;
      if (bottom) document.documentElement.style.setProperty("--nav-top", `${Math.round(bottom)}px`);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onResize = () => (window.innerWidth > 1080 ? setOpen(false) : place());
    place();
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href) => pathname?.startsWith(href) || (href === "/produits/" && pathname?.startsWith("/produit/"));

  return (
    <>
      <div className="topbar">
        <div className="container">
          <ul>
            <li>
              <Icon name="phone" /> <a href={telHref}>{COMPANY.phone}</a>
            </li>
            <li>
              <Icon name="mail" /> <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </li>
            <li className="hide-sm">
              <Icon name="clock" /> {COMPANY.hoursShort}
            </li>
          </ul>
          <span className="hide-sm">Importation · Négoce · Distribution — {COMPANY.city}</span>
        </div>
      </div>
      <header className="site-header" ref={headerRef}>
        <div className="container header-inner">
          <Logo />
          <nav id="main-nav" className={`main-nav ${open ? "open" : ""}`} aria-label="Navigation principale">
            <ul>
              {NAV.map((item) => (
                <li key={item.href} className={item.mega ? "has-mega" : undefined}>
                  <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
                    {item.label}
                    {item.mega ? <Icon name="chevron" className="caret" /> : null}
                  </Link>
                  {item.mega ? (
                    <div className="mega">
                      {SECTORS.map((s) => {
                        const cats = categories.filter((c) => c.sector === s.slug);
                        return (
                          <div key={s.slug}>
                            <h3>
                              <Link href={`/secteurs/${s.slug}/`}>{s.name}</Link>
                            </h3>
                            <ul>
                              {cats.length ? (
                                cats.map((c) => (
                                  <li key={c._id}>
                                    <Link href={`/produits/${c.slug}/`}>{c.name}</Link>
                                  </li>
                                ))
                              ) : (
                                <li>
                                  <Link href={`/secteurs/${s.slug}/`}>Voir la gamme</Link>
                                </li>
                              )}
                            </ul>
                          </div>
                        );
                      })}
                      <div className="all">
                        <Link href="/produits/" className="link-arrow">
                          Tout le catalogue <Icon name="arrow" />
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
          <div className="header-actions">
            <Link href="/devis/" className="btn btn-accent btn-sm quote-pill" aria-label={`Demande de devis (${items.length} produit${items.length > 1 ? "s" : ""})`}>
              <Icon name="clipboard" />
              <span className="btn-label">Demande de devis</span>
              {items.length ? <span className="quote-count">{items.length}</span> : null}
            </Link>
            <button type="button" className="burger" aria-expanded={open} aria-controls="main-nav" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setOpen((v) => !v)}>
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
