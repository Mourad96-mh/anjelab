import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import Photo from "@/components/Photo";
import Icon from "@/components/Icon";
import { SECTORS } from "@/lib/sectors";

export const metadata = {
  title: "La société",
  description:
    "ANJELAB, société marocaine d'importation, de négoce et de distribution de matières premières pour la cosmétique, la détergence et l'ennoblissement textile.",
  alternates: { canonical: "/a-propos/" },
};

// Copy taken from the client's own brief (file.txt), lightly edited.
export default function AboutPage() {
  return (
    <>
      <PageBanner
        crumbs={[{ label: "La société" }]}
        title="ANJELAB"
        lead="Société marocaine spécialisée dans l'importation, le négoce et la distribution de matières premières dédiées aux secteurs cosmétique, détergence et ennoblissement textile."
        photo="textile"
      />
      <section className="section">
        <div className="container split">
          <div>
            <div className="rule" />
            <h2>Notre métier</h2>
            <p className="lead">
              ANJELAB approvisionne les laveries industrielles, blanchisseries, pressings, ateliers de délavage et fabricants de
              produits détergents et cosmétiques en matières premières de qualité constante.
            </p>
            <ul className="points">
              {SECTORS.map((s) => (
                <li key={s.slug}>
                  <strong>
                    <Link href={`/secteurs/${s.slug}/`}>{s.name}</Link>
                  </strong>
                  <span>{s.short}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="split-media">
            <Photo name="dyeing" sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
        </div>
      </section>
      <section className="section section-alt">
        <div className="container split">
          <div className="split-media">
            <Photo name="lab" sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
          <div>
            <div className="rule" />
            <h2>Notre engagement</h2>
            <p>
              ANJELAB apporte les réponses les mieux adaptées aux besoins de sa clientèle et de ses fournisseurs, grâce à sa
              large gamme de produits et à son service technico-commercial.
            </p>
            <p>
              ANJELAB s&apos;inscrit dans une démarche de qualité en développant constamment des techniques innovantes, dans le
              respect des normes en vigueur, de l&apos;environnement et de votre budget.
            </p>
            <Link href="/contact/" className="link-arrow">
              Contacter l&apos;équipe <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
