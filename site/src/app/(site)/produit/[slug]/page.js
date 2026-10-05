import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import AddToQuote from "@/components/AddToQuote";
import Icon from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import { getCatalogue, getProduct, relatedProducts } from "@/lib/catalogue";
import { sectorBySlug } from "@/lib/sectors";
import { COMPANY, telHref, whatsappHref } from "@/lib/company";

export const revalidate = 300;
// Products added in /admin after the build are rendered on first request,
// then cached — and the API purges the cache on every change.
export const dynamicParams = true;

export async function generateStaticParams() {
  const { products } = await getCatalogue();
  return products.map((p) => ({ slug: p.slug }));
}

const absolute = (url) => (url?.startsWith("/") ? `${COMPANY.siteUrl}${url}` : url);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produit introuvable", robots: { index: false } };
  const title = product.seo?.title || `${product.name} — ${product.category?.name || "Matière première"}`;
  const description = product.seo?.description || product.shortDescription;
  const image = absolute(product.images?.[0]?.url);
  return {
    title,
    description,
    keywords: product.seo?.keywords,
    alternates: { canonical: `/produit/${product.slug}/` },
    openGraph: { title, description, type: "website", ...(image ? { images: [{ url: image }] } : {}) },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const catalogue = await getCatalogue();
  const product = catalogue.products.find((p) => p.slug === slug);
  if (!product) notFound();

  const related = relatedProducts(catalogue, product);
  const category = product.category;
  const mainSector = sectorBySlug(category?.sector);
  const quoteItem = { _id: product._id, slug: product.slug, name: product.name };
  const waMessage = `Bonjour ANJELAB, je souhaite un devis pour : ${product.name}.\nQuantité : \nVille : `;

  return (
    <>
      <section className="section product-top-section">
        <div className="container">
          <Breadcrumbs
            items={[
              { href: "/produits/", label: "Produits" },
              ...(category ? [{ href: `/produits/${category.slug}/`, label: category.name }] : []),
              { label: product.name },
            ]}
          />
          <div className="product-top">
            <div>
              <ProductGallery product={product} />
              {product.images?.length ? <p className="photo-note">Photo non contractuelle.</p> : null}
            </div>
            <div className="product-info">
              <p className="sectors">
                {category ? <Link href={`/produits/${category.slug}/`}>{category.name}</Link> : null}
                {product.sectors.map((s) => (
                  <span key={s}>
                    {" · "}
                    <Link href={`/secteurs/${s}/`}>{sectorBySlug(s)?.name || s}</Link>
                  </span>
                ))}
              </p>
              <h1>{product.name}</h1>
              {product.shortDescription ? <p className="lead">{product.shortDescription}</p> : null}
              <div className="product-ctas">
                <AddToQuote product={quoteItem} />
                <a href={whatsappHref(waMessage)} className="btn btn-outline" target="_blank" rel="noopener noreferrer">
                  <Icon name="whatsapp" /> Devis WhatsApp
                </a>
                <a href={telHref} className="btn btn-outline">
                  <Icon name="phone" /> {COMPANY.phone}
                </a>
              </div>
              {product.specs?.length ? (
                <table className="spec-table">
                  <caption>Caractéristiques</caption>
                  <tbody>
                    {product.specs.map((s) => (
                      <tr key={s.label}>
                        <th scope="row">{s.label}</th>
                        <td>{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container product-body">
          <div>
            {product.description ? (
              <>
                <h2>Description</h2>
                <p>{product.description}</p>
              </>
            ) : null}
            {product.applications?.length ? (
              <>
                <h2>Applications</h2>
                <ul className="bullets">
                  {product.applications.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {product.benefits?.length ? (
              <>
                <h2>Avantages</h2>
                <ul className="bullets">
                  {product.benefits.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
          <aside>
            <div className="docs-box">
              <h2>Documentation technique</h2>
              {product.documents?.length ? (
                <div style={{ marginBottom: 16, borderTop: "1px solid var(--line)" }}>
                  {product.documents.map((d) => (
                    <a key={d.url} href={d.url} className="doc-link" target="_blank" rel="noopener noreferrer">
                      <Icon name="file" /> {d.label}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ fontSize: "0.93rem" }}>
                  Fiche technique et fiche de données de sécurité (FDS) communiquées sur demande.
                </p>
              )}
              <p className="notice" style={{ marginBottom: 18 }}>
                Dosages et conditions d&apos;emploi dépendent de votre procédé et de votre matériel : notre service
                technico-commercial vous aide à les définir.
              </p>
              <AddToQuote product={quoteItem} block />
            </div>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="section">
          <div className="container">
            <div className="section-head rule">
              <h2>Dans la même gamme</h2>
            </div>
            <div className="grid grid-4">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description || product.shortDescription,
          url: `${COMPANY.siteUrl}/produit/${product.slug}/`,
          ...(product.images?.length ? { image: product.images.map((i) => absolute(i.url)) } : {}),
          category: [mainSector?.name, category?.name].filter(Boolean).join(" > "),
          brand: { "@type": "Brand", name: COMPANY.name },
          ...(product.specs?.length
            ? { additionalProperty: product.specs.map((s) => ({ "@type": "PropertyValue", name: s.label, value: s.value })) }
            : {}),
        }}
      />
    </>
  );
}
