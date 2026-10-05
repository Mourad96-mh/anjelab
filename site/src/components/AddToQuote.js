"use client";

import Link from "next/link";
import Icon from "./Icon";
import { useQuote } from "./QuoteProvider";

// variant "button" (product page) or "link" (compact, for cards and tables).
export default function AddToQuote({ product, variant = "button", block = false }) {
  const { add, has, ready } = useQuote();
  const added = ready && has(product.slug);

  if (variant === "link") {
    return added ? (
      <Link href="/devis/" className="add-link added">
        <Icon name="check" /> Dans le devis
      </Link>
    ) : (
      <button type="button" className="add-link" onClick={() => add(product)}>
        <Icon name="plus" /> Ajouter au devis
      </button>
    );
  }

  const cls = `btn ${block ? "btn-block" : ""}`;
  return added ? (
    <Link href="/devis/" className={`${cls} btn-outline`}>
      <Icon name="check" /> Ajouté à votre devis
    </Link>
  ) : (
    <button type="button" className={`${cls} btn-accent`} onClick={() => add(product)}>
      <Icon name="plus" /> Ajouter au devis
    </button>
  );
}
