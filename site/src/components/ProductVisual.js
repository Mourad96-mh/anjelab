// Product photo, or a neutral, explicit placeholder when the client has not
// supplied one yet — never a fake image.
export default function ProductVisual({ product, eager = false }) {
  const image = product.images?.[0];
  if (image?.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image.url} alt={image.alt || product.name} loading={eager ? "eager" : "lazy"} width="800" height="600" />
    );
  }
  return (
    <div className="placeholder" role="img" aria-label={`${product.name} — photo à venir`}>
      <strong>{product.category?.name || "ANJELAB"}</strong>
      Photo à venir
    </div>
  );
}
