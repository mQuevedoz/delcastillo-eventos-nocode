import { Link } from "react-router-dom";


function resolveThumbSrc(imageLike) {
  // Soporta string (id o url), u objetos { imageId | id | _id | url }
  if (!imageLike) return null;

  // url absoluta
  if (typeof imageLike === "string" && /^https?:\/\//i.test(imageLike)) {
    return imageLike;
  }
  if (typeof imageLike === "object" && imageLike.url && /^https?:\/\//i.test(imageLike.url)) {
    return imageLike.url;
  }

  // id “crudo”
  const id = typeof imageLike === "string"
    ? imageLike
    : imageLike.imageId || imageLike.id || imageLike._id;

  if (!id) return null;

  const BASE = (import.meta.env.VITE_API_URL?.replace(/\/$/, "")) || "";
  return `${BASE}/api/images/thumb/${id}`;
}


export default function ServiceCard({ service }) {
  // Portada: isCover o primera
  const firstImg =
    (service.images || []).find(im => im?.isCover) ||
    (service.images || [])[0];

  const imgSrc =
    resolveThumbSrc(firstImg) ||
    "/placeholder.png";

  const hasMin = Number.isFinite(Number(service.capacityMin));
  const hasMax = Number.isFinite(Number(service.capacityMax));
  const capText =
    hasMin && hasMax
      ? `${service.capacityMin}–${service.capacityMax}`
      : hasMin
      ? `${service.capacityMin}+`
      : hasMax
      ? `Hasta ${service.capacityMax}`
      : null;

  return (
    <div className="card service-card h-100">
      <div className="card-img">
        <img fetchPriority="high" src={imgSrc} alt={service.name} className="card-img-top" loading="lazy" decoding="async" />
      </div>

      <div className="card-body service-card__body">
        <h5 className="service-card__title">{service.name}</h5>

        <div className="service-card__meta">
          {service.category && (
            <span className="service-card__pill">{service.category}</span>
          )}
          {capText && (
            <span className="service-card__pill">Capacidad: {capText}</span>
          )}
        </div>

        {service.description && (
          <p className="service-card__desc">{service.description}</p>
        )}

        <Link className="btn btn-warning text-white mt-auto" to={`/service/${service._id}`}>
          Ver detalle
        </Link>
      </div>
    </div>
  );
}
