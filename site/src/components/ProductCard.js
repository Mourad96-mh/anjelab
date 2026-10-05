import Link from "next/link";
import ProductVisual from "./ProductVisual";
import AddToQuote from "./AddToQuote";
import Icon from "./Icon";

export default function ProductCard({ product }) {
  const href = `/produit/${product.slug}/`;
  return (
    <article className="product-card">
      <Link href={href} className="thumb" tabIndex={-1} aria-hidden="true">
        <ProductVisual product={product} />
      </Link>
      <div className="body">
        {product.category?.name ? <span className="cat">{product.category.name}</span> : null}
        <h3>
          <Link href={href}>{product.name}</Link>
        </h3>
        {product.shortDescription ? <p>{product.shortDescription}</p> : null}
        <div className="actions">
          <Link href={href} className="link-arrow" style={{ fontSize: "0.88rem" }}>
            Fiche produit <Icon name="arrow" />
          </Link>
          <AddToQuote product={{ _id: product._id, slug: product.slug, name: product.name }} variant="link" />
        </div>
      </div>
    </article>
  );
}
