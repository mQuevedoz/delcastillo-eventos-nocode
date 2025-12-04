// src/components/CasaCard.jsx
import { useMemo } from "react";

export default function CasaCard({ casa }) {
  // Ordena las imágenes poniendo la portada (isCover=true) primero
  const cover = useMemo(() => {
    const arr = Array.isArray(casa?.imagenes) ? [...casa.imagenes] : [];
    arr.sort((a, b) => (a.isCover === b.isCover ? 0 : a.isCover ? -1 : 1));
    return arr[0] || null;
  }, [casa]);

  const img = cover?.url || "/boda1.jpeg"; // fallback si no hay imágenes

  return (
    <div className="card shadow-sm h-100">
      <img
        src={img}
        alt={casa.nombre}
        className="card-img-top"
        style={{ objectFit: "cover", height: 220 }}
        loading="lazy"
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title mb-1">{casa.nombre}</h5>
        <div className="text-muted small mb-2">{casa.direccion}</div>

        <ul className="list-unstyled small mb-3">
          <li><strong>Área:</strong> {casa.areaM2} m²</li>
          <li><strong>Capacidad:</strong> {casa.capacidad} personas</li>
          <li><strong>Horario máx.:</strong> {casa.horaFinEvento}</li>
        </ul>

        {typeof casa.precioDesde === "number" && (
          <div className="fw-semibold mb-2">Desde: S/ {casa.precioDesde}</div>
        )}

        <a href={`/casas/${casa.slug}`} className="btn btn-outline-dark mt-auto">
          Ver detalle
        </a>
      </div>
    </div>
  );
}
