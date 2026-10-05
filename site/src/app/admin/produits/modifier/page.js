"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

// /admin/produits/modifier/?id=<id> — a query string rather than /<id>/ because
// the static export only contains pages known at build time.
function EditProduct() {
  const id = useSearchParams().get("id");
  return id ? <ProductForm key={id} productId={id} /> : <p>Produit introuvable.</p>;
}

export default function EditProductPage() {
  return (
    <Suspense fallback={null}>
      <EditProduct />
    </Suspense>
  );
}
