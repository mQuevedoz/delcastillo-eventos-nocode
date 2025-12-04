import { useEffect, useState } from "react";

function ExtraGalleryModal({ extra, onClose, onUploaded, onDeleteImage, onMakeCover }) {
  const [files, setFiles] = useState([]);

  useEffect(() => setFiles([]), [extra?._id]);

  const upload = async () => {
    if (!files.length) return;
    const body = new FormData();
    for (const f of files) body.append("files", f);

    try {
      const resp = await fetch("/api/images", { method: "POST", body }); // tu endpoint real
      if (!resp.ok) throw new Error("Error al subir imagen");
      const data = await resp.json(); // ajusta si tu respuesta difiere
      // asume array [{url}, ...]
      for (const img of data) {
        await onUploaded(extra._id, img.url);
      }
      setFiles([]);
    } catch (err) {
      console.error("Error subiendo imágenes:", err);
      alert("Error al subir imágenes");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ width: 860 }}>
        <h3>Galería — {extra.name}</h3>

        <div style={{ display: "flex", gap: 16 }}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles([...e.target.files])}
          />
          <button className="btn btn-primary" onClick={upload}>
            Subir
          </button>
          <button className="btn btn-light" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(4, 1fr)",
          }}
        >
          {extra.images?.map((img) => (
            <figure
              key={img._id}
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 8,
              }}
            >
              <img
                src={img.url}
                style={{
                  width: "100%",
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 8,
                  justifyContent: "space-between",
                }}
              >
                <button
                  className="btn btn-light"
                  onClick={() => onMakeCover(extra._id, img._id)}
                >
                  {img.isCover ? "✔ Portada" : "Hacer portada"}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => onDeleteImage(extra._id, img._id)}
                >
                  Eliminar
                </button>
              </div>
            </figure>
          ))}
          {!extra.images?.length && <p>Sin imágenes.</p>}
        </div>
      </div>
    </div>
  );
}

// 👇 Exportaciones corregidas
export default ExtraGalleryModal;
export { ExtraGalleryModal };
