"use client";

import Link from "next/link";
import { useEffect } from "react";
import Icon from "./Icon";
import { useQuote } from "./QuoteProvider";
import { telHref, whatsappHref } from "@/lib/company";

// Sticky Appeler / WhatsApp / Devis bar on phones (Moroccan B2B buyers call or
// WhatsApp first — research/market-and-competitors.md).
export default function MobileCta() {
  const { items } = useQuote();
  useEffect(() => {
    document.body.classList.add("has-mobile-cta");
    return () => document.body.classList.remove("has-mobile-cta");
  }, []);
  return (
    <nav className="mobile-cta" aria-label="Contact rapide">
      <a href={telHref}>
        <Icon name="phone" /> Appeler
      </a>
      <a href={whatsappHref()} className="wa" target="_blank" rel="noopener noreferrer">
        <Icon name="whatsapp" /> WhatsApp
      </a>
      <Link href="/devis/">
        <Icon name="clipboard" /> Devis
        {items.length ? <span className="badge">{items.length}</span> : null}
      </Link>
    </nav>
  );
}
