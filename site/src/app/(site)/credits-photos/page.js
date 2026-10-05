import PageBanner from "@/components/PageBanner";
import credits from "@/data/image-credits.json";

export const metadata = {
  title: "Crédits photos",
  alternates: { canonical: "/credits-photos/" },
  robots: { index: false, follow: true },
};

// Required by the CC BY / CC BY-SA licences of several photos: author,
// licence and source for every illustration used on the site.
export default function CreditsPage() {
  const rows = [
    ...Object.entries(credits.site || {}).map(([k, c]) => ({ ...c, src: `/images/site/${k}.webp` })),
    ...Object.entries(credits.products || {}).map(([k, c]) => ({ ...c, src: `/images/products/${k}.webp` })),
  ];
  return (
    <>
      <PageBanner
        crumbs={[{ label: "Crédits photos" }]}
        title="Crédits photos"
        lead="Les photographies du site sont des illustrations issues de banques d'images sous licence libre. Elles ne représentent pas les locaux ni les conditionnements d'ANJELAB."
      />
      <section className="section">
        <div className="container prose" style={{ maxWidth: 900 }}>
          <ul className="credits-list">
            {rows.map((c) => (
              <li key={c.src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.src} alt="" loading="lazy" width="120" height="80" />
                <div>
                  <strong>{c.title}</strong>
                  <br />
                  {c.artist ? `${c.artist} — ` : ""}
                  {c.license}
                  {c.page ? (
                    <>
                      {" — "}
                      <a href={c.page} target="_blank" rel="noopener noreferrer nofollow">
                        source
                      </a>
                    </>
                  ) : null}
                  {c.modified ? " — recadrée et redimensionnée" : ""}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
