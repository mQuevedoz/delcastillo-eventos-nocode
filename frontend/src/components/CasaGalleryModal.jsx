// src/components/CasaGalleryModal.jsx
import { useEffect, useMemo, useState } from "react";

export default function CasaGalleryModal({ open, onClose, casa }) {
  // Ordena: portada primero, luego el resto en el orden en que vienen
  const imgs = useMemo(() => {
    const arr = Array.isArray(casa?.imagenes) ? [...casa.imagenes] : [];
    // portada primero
    arr.sort((a, b) => (a.isCover === b.isCover ? 0 : a.isCover ? -1 : 1));
    return arr;
  }, [casa]);

  const [idx, setIdx] = useState(0);

  // Cada vez que se abre o cambia la casa, arrancar en la portada (posición 0)
  useEffect(() => {
    if (open) setIdx(0);
  }, [open, casa?._id]);

  if (!open || !casa) return null;

  const hasImgs = imgs.length > 0;
  const current = hasImgs ? imgs[idx] : null;

  function prev() {
    if (!hasImgs) return;
    setIdx((i) => (i - 1 + imgs.length) % imgs.length);
  }
  function next() {
    if (!hasImgs) return;
    setIdx((i) => (i + 1) % imgs.length);
  }

  return (
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close position-absolute top-0 end-0 m-3" onClick={onClose} />

        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="carousel-box">
              {hasImgs ? (
                <>
                  <img
                    src={current.url}
                    alt={`${casa.nombre} ${idx + 1}`}
                    loading="eager"        // la grande siempre eager
                  />
                  {imgs.length > 1 && (
                    <>
                      <button className="carousel-btn left" onClick={prev}>&lsaquo;</button>
                      <button className="carousel-btn right" onClick={next}>&rsaquo;</button>
                    </>
                  )}
                </>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                  Sin imágenes
                </div>
              )}
            </div>

            {imgs.length > 1 && (
              <div className="thumbs mt-2 d-flex gap-2 flex-wrap">
                {imgs.map((im, i) => (
                  <img
                    key={im._id || im.imageId || i}
                    src={im.url}
                    onClick={() => setIdx(i)}
                    className={`thumb ${i === idx ? "active" : ""}`}
                    alt={`thumb-${i + 1}`}
                    loading="lazy"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="col-12 col-lg-5">
            <h4 className="mb-1">{casa.nombre}</h4>
            <div className="text-muted small mb-2">{casa.direccion}</div>
            <ul className="list-unstyled small mb-3">
              <li><strong>Área:</strong> {casa.areaM2} m²</li>
              <li><strong>Capacidad:</strong> {casa.capacidad} personas</li>
              <li><strong>Horario máx.:</strong> {casa.horaFinEvento}</li>
            </ul>
            {casa.detalles && <p className="small">{casa.detalles}</p>}
            {typeof casa.precioDesde === "number" && (
              <div className="fw-semibold">Desde: S/ {casa.precioDesde}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
