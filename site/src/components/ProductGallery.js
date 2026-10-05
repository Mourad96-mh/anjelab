"use client";

import { useState } from "react";
import ProductVisual from "./ProductVisual";

export default function ProductGallery({ product }) {
  const images = product.images || [];
  const [index, setIndex] = useState(0);
  const current = images[index];

  return (
    <div>
      <div className="gallery-main">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt={current.alt || product.name} width="1200" height="900" />
        ) : (
          <ProductVisual product={product} eager />
        )}
      </div>
      {images.length > 1 ? (
        <div className="gallery-thumbs">
          {images.map((img, i) => (
            <button key={img.url} type="button" aria-current={i === index} aria-label={`Image ${i + 1}`} onClick={() => setIndex(i)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" loading="lazy" width="72" height="72" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
