import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { listServices } from "../api/services.js";
import LeadForm from "../components/LeadForm.jsx";

/* Helpers locales para construir URLs de imágenes */
const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
const fileUrl  = (id) => `${BASE}/api/images/${id}`;
const thumbUrl = (id) => `${BASE}/api/images/thumb/${id}`;

const isHttp = (v) => typeof v === "string" && /^https?:\/\//i.test(v);

function resolveSrc(img, { thumb = false } = {}) {
  if (!img) return null;

  // string
  if (typeof img === "string") {
    if (isHttp(img)) return img;
    return thumb ? thumbUrl(img) : fileUrl(img);
  }

  // objeto con url directa http(s)
  if (img?.url && isHttp(img.url)) return img.url;

  // posible {imageId} / {id} / {_id}
  const id = img.imageId || img.id || img._id;
  if (!id) return null;
  return thumb ? thumbUrl(id) : fileUrl(id);
}

/* -------------------- Galería -------------------- */
function Gallery({ images = [] }) {
  // arrancar en portada si existe
  const startIndex = useMemo(() => {
    if (!images.length) return 0;
    const i = images.findIndex((im) => !!im?.isCover);
    return i >= 0 ? i : 0;
  }, [images]);

  const [idx, setIdx] = useState(startIndex);
  useEffect(() => setIdx(startIndex), [startIndex]);

  const go = useCallback(
    (dir) => {
      if (!images.length) return;
      setIdx((i) => (i + dir + images.length) % images.length);
    },
    [images.length]
  );

  // teclado ← →
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(+1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [go]);

  if (!images.length) {
    return (
      <div className="box gallery-box placeholder">
        <div className="placeholder">Galería aquí</div>
      </div>
    );
  }

  const current = images[idx];
  const bigOriginal = resolveSrc(current, { thumb: false }) || resolveSrc(current, { thumb: true });
  const idForSrc = current?.imageId || current?.id || current?._id;
  const big = resolveSrc(current, { thumb: false });
  const small = resolveSrc(current, { thumb: true });

  return (
    <div className="box gallery-box">
      {/* visor principal */}
      <div className="gallery-viewport">
        {images.length > 1 && (
          <button className="gallery-arrow left" onClick={() => go(-1)} aria-label="Anterior">
            ‹
          </button>
        )}
        <img
          className="gallery-main"
          src={big || small}
          srcSet={
            [
              small ? `${small} 800w` : null,     
              big   ? `${big} 1600w` : null       
            ].filter(Boolean).join(", ")
          }
          sizes="(max-width: 900px) 100vw, 720px" 
          alt={current?.alt || `Imagen ${idx + 1}`}
          decoding="async"
          loading="eager"
          onError={(e) => {
            // fallback: si falla el original, usa el thumb
            if (small && e.currentTarget.src !== small) {
              e.currentTarget.src = small;
              e.currentTarget.removeAttribute("srcset");
              e.currentTarget.removeAttribute("sizes");
            }
          }}
        />
        {images.length > 1 && (
          <button className="gallery-arrow right" onClick={() => go(+1)} aria-label="Siguiente">
            ›
          </button>
        )}
      </div>

      {/* miniaturas */}
      <div className="gallery-thumbs">
        {images.map((im, i) => {
          const t = resolveSrc(im, { thumb: true }) || resolveSrc(im, { thumb: false });
        return (
            <button
              key={i}
              className={`gallery-thumb ${i === idx ? "active" : ""}`}
              onClick={() => setIdx(i)}
              aria-label={`Ir a imagen ${i + 1}`}
            >
              {t ? (
                <img
                  src={t}
                  alt={im?.alt || `Miniatura ${i + 1}`}
                  loading="lazy"
                  onError={(e) => {
                    // si el thumb falla, intenta original
                    const altSrc = resolveSrc(im, { thumb: false });
                    if (altSrc && e.currentTarget.src !== altSrc) {
                      e.currentTarget.src = altSrc;
                    }
                  }}
                />
              ) : (
                <div className="thumb-ph">—</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------- Página -------------------- */
export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);

  useEffect(() => {
    listServices().then((data) => {
      const found = data.find((s) => s._id === id);
      setService(found || null);
    });
  }, [id]);

  if (!service)
    return (
      <div className="container">
        <p>Cargando...</p>
      </div>
    );

  // normalizar imágenes (acepta string u objeto)
  const imgs = (service.images || [])
    .filter(Boolean)
    .map((im) => (typeof im === "string" ? { imageId: im } : im));

  return (
    <div className="container detail">
      <Link to="/" className="link">← Volver</Link>

      <h1>{service.name}</h1>
      <p className="muted" style={{ marginTop: -6 }}>{service.category}</p>
      {service.description && <p className="desc">{service.description}</p>}

      <div className="split">
        <Gallery images={imgs} />
        <div className="box">
          <LeadForm service={service} />
        </div>
      </div>
    </div>
  );
}
