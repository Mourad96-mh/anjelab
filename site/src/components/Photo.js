import { media } from "@/lib/media";

// <img> for a site photo from lib/media.js; renders nothing if the file was
// not imported, so a missing photo never shows a broken image.
export default function Photo({ name, eager = false, sizes, className }) {
  const m = media(name);
  if (!m) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={m.src} alt={m.alt} width={m.width} height={m.height} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : undefined} sizes={sizes} className={className} />
  );
}
