import { useEffect, useMemo, useState } from "react";
import {
  adminDeleteExtraImage as delExtraImage,
  adminSetExtraCover as setExtraCover, // opcional: lo usamos si borran la portada
} from "../api/adminExtras";

/**
 * Props:
 *  - initial: {_id?, name, price, description, images: [{_id,url,isCover}]}
 *  - onClose()
 *  - onSave(payload, files[], selectedCoverId)
 *
 * Subida: los archivos se suben cuando presionas Guardar (como ya lo tenías).
 * Ahora: puedes eliminar imágenes existentes desde aquí mismo.
 */
export default function ExtraModal({ initial = {}, onClose, onSave }) {
  const [name, setName] = useState(initial.name || "");
  const [price, setPrice] = useState(initial.price ?? 0);
  const [description, setDescription] = useState(initial.description || "");
  const [files, setFiles] = useState([]);
  const [images, setImages] = useState(() => initial.images || []);
  const [loadingDel, setLoadingDel] = useState(null); // imageId en eliminación

  // portada seleccionada (radio)
  const selectedCoverId = useMemo(() => {
    const cover = images.find((i) => i.isCover);
    return cover?._id || null;
  }, [images]);

  // si llega un nuevo initial
  useEffect(() => {
    setName(initial.name || "");
    setPrice(initial.price ?? 0);
    setDescription(initial.description || "");
    setImages(initial.images || []);
    setFiles([]);
  }, [initial?._id]);

  // marca portada localmente al tocar el radio
  const chooseCover = (imageId) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isCover: img._id === imageId,
      }))
    );
  };

  // eliminar imagen existente (aplica de inmediato contra el backend)
  const handleDeleteImage = async (imageId) => {
    if (!initial?._id) {
      // si aún no existe el documento (modo crear), no debería haber imágenes en servidor
      setImages((prev) => prev.filter((x) => x._id !== imageId));
      return;
    }
    if (!confirm("¿Eliminar esta imagen?")) return;
    try {
      setLoadingDel(imageId);
      // 1) borrar en backend
      const doc = await delExtraImage(initial._id, imageId);
      // 2) actualizar local
      setImages(doc.images || []);

      // 3) si borraron la portada y aún quedan imágenes, fija la primera como portada
      const still = doc.images || [];
      if (still.length && !still.some((i) => i.isCover)) {
        await setExtraCover(initial._id, still[0]._id);
        setImages((p) =>
          p.map((img, idx) => ({ ...img, isCover: idx === 0 }))
        );
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar la imagen.");
    } finally {
      setLoadingDel(null);
    }
  };

  // guardar: delega la subida de archivos y set de portada al padre (AdminExtras.jsx)
  const submit = async () => {
    const payload = {
      name: name.trim(),
      price: Number(price) || 0,
      description: description?.trim() || "",
    };

    // portada elegida
    const cover = images.find((i) => i.isCover);
    const coverId = cover?._id || null;

    await onSave(payload, files, coverId);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ width: "min(1100px, 96vw)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>
            {initial?._id ? "Editar extra" : "Añadir extra"}
          </h3>
          <div className="btn-group" style={{ gap: 8 }}>
            <button className="btn btn-light" onClick={onClose}>
              Volver
            </button>
            <button className="btn btn-primary" onClick={submit}>
              Guardar
            </button>
          </div>
        </div>

        <div className="modal-body form-grid">
            {/* Fila 1: Nombre / Precio */}
            <div className="field">
                <label className="label">Nombre *</label>
                <input
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del extra"
                />
            </div>

            <div className="field">
                <label className="label">Precio (S/)</label>
                <input
                className="form-control"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                />
            </div>

            {/* Descripción (ancho completo) */}
            <div className="field wide">
                <label className="label">Descripción</label>
                <textarea
                className="form-control"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descripción del extra"
                />
            </div>

            {/* Galería existente */}
            <div className="field wide">
                <label className="label">Imágenes existentes</label>

                {images?.length ? (
                    <div className="gallery-grid">
                    {images.map((img) => (
                        <figure key={img._id} className="gallery-item">
                        <img src={img.url} alt="" className="gallery-thumb" />

                        <div className="gallery-controls">
                            <label className="cover-radio">
                            <input
                                type="radio"
                                name="cover"
                                checked={!!img.isCover}
                                onChange={() => chooseCover(img._id)}
                            />
                            <span>{img.isCover ? "✔ Portada" : "Elegir portada"}</span>
                            </label>

                            <button
                            type="button"
                            className="btn btn-danger gallery-del"
                            onClick={() => handleDeleteImage(img._id)}
                            >
                            Eliminar
                            </button>
                        </div>
                        </figure>
                    ))}
                    </div>
                ) : (
                    <p className="muted">Aún no hay imágenes.</p>
                )}
            </div>



            {/* Nuevas imágenes (ancho completo) */}
            <div className="field wide">
                <label className="label">Agregar nuevas imágenes</label>
                <p className="muted" style={{ marginTop: 0 }}>
                Se subirán y asociarán cuando presiones <b>Guardar</b>.
                </p>
                <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
                {files?.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 12 }}>
                    {files.length} archivo(s) listo(s) para subir.
                </div>
                )}
            </div>
            </div>
      </div>
    </div>
  );
}
