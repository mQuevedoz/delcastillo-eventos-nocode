import { useEffect, useMemo, useState } from "react";

export default function ExtraPreviewModal({ extra, onClose }) {
  const images = useMemo(() => extra?.images || [], [extra]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    // mostrar desde portada si existe
    const start = Math.max(0, images.findIndex(i => i.isCover));
    setIdx(start === -1 ? 0 : start);
  }, [images]);

  const hasImages = images.length > 0;
  const current = hasImages ? images[idx] : null;

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ width: "min(1080px, 95vw)", padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen grande */}
        <div style={{ position: "relative", background: "#000" }}>
          {current ? (
            <img
              src={current.url}
              alt=""
              style={{
                width: "100%",
                height: "58vh",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div style={{ height: "58vh", display: "grid", placeItems: "center", color: "#888" }}>
              Sin imágenes
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                className="btn btn-light"
                style={{ position: "absolute", top: "50%", left: 10, transform: "translateY(-50%)" }}
                onClick={prev}
              >
                ‹
              </button>
              <button
                className="btn btn-light"
                style={{ position: "absolute", top: "50%", right: 10, transform: "translateY(-50%)" }}
                onClick={next}
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Miniaturas */}
        {images.length > 1 && (
          <div style={{ padding: 12, display: "flex", gap: 10, overflowX: "auto" }}>
            {images.map((img, i) => (
              <img
                key={img._id || i}
                src={img.url}
                alt=""
                onClick={() => setIdx(i)}
                style={{
                  width: 120,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: i === idx ? "2px solid #f59e0b" : "1px solid #e5e7eb",
                }}
              />
            ))}
          </div>
        )}

        {/* Texto */}
        <div style={{ padding: "0 16px 16px" }}>
          <h3 style={{ margin: "8px 0 4px" }}>{extra.name}</h3>
          <div style={{ marginBottom: 8, color: "#6b7280" }}>
            Precio referencial: <b>S/ {Number(extra.price || 0).toFixed(2)}</b>
          </div>
          <p style={{ margin: 0 }}>{extra.description}</p>
        </div>
      </div>
    </div>
  );
}
