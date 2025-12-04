// src/components/CasaModal.jsx
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { addCasaImages, removeCasaImage, setCoverCasa } from "../api/casas";
import { imageUrl as fullUrl, thumbUrl } from "../api/services";

export default function CasaModal({ casa, onClose, onSave }) {
  const editing = !!casa?._id;

  const [form, setForm] = useState({
    nombre: "", direccion: "", areaM2: "", capacidad: "",
    horaFinEvento: "", detalles: "", precioDesde: "",
  });

  // imágenes existentes (cuando editas) + estado local de portada
  const [images, setImages] = useState([]);
  // archivos elegidos en "Nueva casa" (se suben después de crear)
  const [pendingFiles, setPendingFiles] = useState([]);

  useEffect(() => {
    if (casa) {
      setForm({
        nombre:        casa.nombre        || "",
        direccion:     casa.direccion     || "",
        areaM2:        casa.areaM2        || "",
        capacidad:     casa.capacidad     || "",
        horaFinEvento: casa.horaFinEvento || "",
        detalles:      casa.detalles      || "",
        precioDesde:   casa.precioDesde   ?? "",
      });
      setImages(casa.imagenes || []);
    } else {
      setForm({
        nombre: "", direccion: "", areaM2: "", capacidad: "",
        horaFinEvento: "", detalles: "", precioDesde: "",
      });
      setImages([]);
    }
    setPendingFiles([]);
  }, [casa]);

  const coverId = useMemo(() => images.find(im => im.isCover)?._id || images.find(im => im.isCover)?.publicId, [images]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  async function onUploadEdit(files) {
    if (!files?.length || !editing) return;
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    try {
      const resp = await addCasaImages(casa._id, fd);
      const appended = (resp?.uploaded || []).map(up => ({
        url: fullUrl(up.publicId || up.id),
        thumb: thumbUrl(up.publicId || up.id),
        publicId: up.publicId || up.id,
        isCover: false,
      }));
      setImages(prev => [...prev, ...appended]);
      // si no había portada, el backend ya marcó una; refrescamos desde resp.casa si viene
      if (resp?.casa) setImages(resp.casa.imagenes || []);
    } catch (err) {
      alert("Error subiendo imagen");
      console.error(err);
    }
  }

  async function onRemove(img) {
    if (!editing) {
      // en creación: sólo quita del preview local
      setPendingFiles([]);
      return;
    }
    try {
      await removeCasaImage(casa._id, img._id || img.publicId);
      setImages(prev => prev.filter(i => (i._id || i.publicId) !== (img._id || img.publicId)));
    } catch (err) {
      alert("Error eliminando imagen");
    }
  }

  async function onMakeCover(img) {
    if (!editing) return;
    try {
      const id = img._id || img.publicId;
      const saved = await setCoverCasa(casa._id, id);
      setImages(saved.imagenes || []);
    } catch (err) {
      alert("Error marcando portada");
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // pasa al padre el form y, si es nueva casa, también los archivos para que los suba después de crear
    await onSave(form, editing ? [] : pendingFiles);
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-box box" style={{ maxWidth: 720 }}>
        <h2 style={{ marginBottom: 16 }}>{editing ? "Editar Casa" : "Nueva Casa"}</h2>

        <form className="form" onSubmit={handleSubmit}>
          <div className="row">
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>

          <div className="row">
            <label>Dirección</label>
            <input name="direccion" value={form.direccion} onChange={handleChange} required />
          </div>

          <div className="row two">
            <div>
              <label>Área (m²)</label>
              <input type="number" name="areaM2" value={form.areaM2} onChange={handleChange} min="1" required />
            </div>
            <div>
              <label>Capacidad</label>
              <input type="number" name="capacidad" value={form.capacidad} onChange={handleChange} min="1" required />
            </div>
          </div>

          <div className="row">
            <label>Hora fin de evento</label>
            <input type="time" name="horaFinEvento" value={form.horaFinEvento} onChange={handleChange} required />
          </div>

          <div className="row">
            <label>Detalles</label>
            <textarea name="detalles" rows="3" value={form.detalles} onChange={handleChange} />
          </div>

          <div className="row">
            <label>Precio desde</label>
            <input type="number" name="precioDesde" value={form.precioDesde} onChange={handleChange} min="0" />
          </div>

          {/* ====== Imágenes ====== */}
          <div className="row">
            <label>Imágenes</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (editing) onUploadEdit(files);
                else setPendingFiles(files);
              }}
            />
            <small>Puedes subir varias. La portada es la que se muestra en la tarjeta.</small>

            {/* En edición: mostrar imágenes reales; en creación: previews locales */}
            {editing ? (
              <div className="img-grid">
                {images.length === 0 && <div className="muted">Aún no hay imágenes</div>}
                {images.map((im) => {
                  const id = im._id || im.publicId;
                  const src = im.thumb || im.url;
                  return (
                    <div key={id} className="img-card">
                      <img src={src} alt="" />
                      <div className="actions">
                        <button type="button" className={`btn-xs ${im.isCover ? 'is-cover' : ''}`} onClick={() => onMakeCover(im)}>
                          Portada {im.isCover ? '✔' : ''}
                        </button>
                        <button type="button" className="btn-xs" onClick={() => onRemove(im)}>Eliminar</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="img-grid">
                {pendingFiles.length === 0 && <div className="muted">Guarda la casa para subir las imágenes.</div>}
                {pendingFiles.map((f, i) => (
                  <div key={i} className="img-card">
                    <img src={URL.createObjectURL(f)} alt="" />
                    <div className="actions">
                      <span className="btn-xs">Previa</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
