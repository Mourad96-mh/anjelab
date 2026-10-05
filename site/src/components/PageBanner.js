import Breadcrumbs from "./Breadcrumbs";
import Photo from "./Photo";
import { media } from "@/lib/media";

// Page header: with a photo (sector pages) or plain (catalogue, forms…).
export default function PageBanner({ crumbs, title, lead, photo }) {
  if (photo && media(photo)) {
    return (
      <section className="page-banner">
        <div className="bg">
          <Photo name={photo} eager sizes="100vw" />
        </div>
        <div className="container">
          <Breadcrumbs items={crumbs} />
          <h1>{title}</h1>
          {lead ? <p className="lead">{lead}</p> : null}
        </div>
      </section>
    );
  }
  return (
    <section className="page-head">
      <div className="container">
        <Breadcrumbs items={crumbs} />
        <h1>{title}</h1>
        {lead ? <p className="lead">{lead}</p> : null}
      </div>
    </section>
  );
}
