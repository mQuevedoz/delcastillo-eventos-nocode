// src/pages/AdminServicioEditar.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  adminGetService,
  adminCreateService,
  adminUpdateService,
  uploadImages,
  resolveThumbSrc,
} from "../api/adminServices";

const EMPTY = {
  name: "",
  category: "Boda",
  capacityMin: "",
  capacityMax: "",
  description: "",
  images: [], // [{imageId, alt, isCover, order}]
};

export default function AdminServicioEditar() {
  const { id } = useParams();
  const isNew = !id || id === "nuevo";
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState([]); // FileList -> Array<File>
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Cargar servicio solo si es edición
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (isNew) return;
      try {
        setLoading(true);
        const data = await adminGetService(id);
        if (!mounted) return;
        setForm({
          name: data.name ?? "",
          category: data.category ?? "Boda",
          capacityMin: data.capacityMin ?? "",
          capacityMax: data.capacityMax ?? "",
          description: data.description ?? "",
          images: Array.isArray(data.images) ? data.images : [],
        });
      } catch (e) {
        setErr(e.message || "Error cargando servicio");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id, isNew]);

  const title = useMemo(
    () => (isNew ? "Añadir servicio1" : `Editar servicio1: ${form.name || ""}`),
    [isNew, form.name]
  );

  function updateField(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function onPickFiles(e) {
    const arr = Array.from(e.target.files || []);
    setFiles(arr);
  }

  async function handleSave() {
    try {
      setErr("");
      setLoading(true);

      // Campos base
      const basePayload = {
        name: form.name?.trim(),
        category: form.category,
        capacityMin: form.capacityMin ? Number(form.capacityMin) : undefined,
        capacityMax: form.capacityMax ? Number(form.capacityMax) : undefined,
        description: form.description?.trim() || "",
      };

      if (isNew) {
        // 1) Crear servicio sin imágenes
        const created = await adminCreateService(basePayload);
        const newId = created?._id || created?.id;

        // 2) Subir imágenes (si las hay) y actualizar el servicio
        if (files.length) {
          const uploaded = await uploadImages(files);
          const mapped = uploaded.map((u, idx) => ({
            imageId: u.id || u._id || u.imageId,
            alt: "",
            isCover: idx === 0, // primera como portada por defecto
            order: idx,
          }));
          if (mapped.length) {
            await adminUpdateService(newId, { images: mapped });
          }
        }
      } else {
        // Edición
        const updates = { ...basePayload };

        if (files.length) {
          const uploaded = await uploadImages(files);
          const newImgs = uploaded.map((u, idx) => ({
            imageId: u.id || u._id || u.imageId,
            alt: "",
            isCover: false,
            order: (form.images?.length || 0) + idx,
          }));
          updates.images = [...(form.images || []), ...newImgs];
        }

        await adminUpdateService(id, updates);
      }

      navigate("/admin/servicios");
    } catch (e) {
      setErr(e.message || "No se pudo guardar");
    } finally {
      setLoading(false);
    }
  }

  // Eliminar una imagen (solo en edición)
  async function removeImage(imageId) {
    if (isNew) return; // no hay imágenes persistidas aún
    if (!confirm("¿Eliminar esta imagen?")) return;

    const next = (form.images || []).filter((im) => {
      const currentId = im.imageId || im.id || im._id;
      return currentId !== imageId;
    });
    try {
      setForm((s) => ({ ...s, images: next }));
      await adminUpdateService(id, { images: next });
    } catch (e) {
      setErr(e.message || "No se pudo eliminar la imagen");
    }
  }

  // Marcar portada (solo en edición)
  async function makeCover(imageId) {
    if (isNew) return;
    const next = (form.images || []).map((im) => ({
      ...im,
      isCover: (im.imageId || im.id || im._id) === imageId,
    }));
    try {
      setForm((s) => ({ ...s, images: next }));
      await adminUpdateService(id, { images: next });
    } catch (e) {
      setErr(e.message || "No se pudo actualizar la portada");
    }
  }

  return (
    <div className="container page-content">
      <div className="header" style={{ marginBottom: 12 }}>
        <h2 className="page-title m-0">{title}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            Volver
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>

      {err && (
        <div className="box" style={{ border: "1px solid #f1b0b7", background: "#fff5f6" }}>
          <code style={{ color: "#c0392b", fontSize: ".95rem" }}>{err}</code>
        </div>
      )}

      {/* Datos básicos */}
      <div className="box" style={{ marginBottom: 16 }}>
        <div className="form" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          <div className="row">
            <label>Nombre *</label>
            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Nombre del servicio"
            />
          </div>

          {/* Categoría */}
          <div className="row">
            <label>Categoría</label>
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
            >
              <option>Boda</option>
              <option>Corporativo</option>
              <option>Cumpleaños</option>
              <option>Otro</option>
            </select>
          </div>

          {/* Capacidad: mínima y máxima lado a lado */}
          <div className="row two">
            <div className="form-group">
              <label>Capacidad mínima</label>
              <input
                type="number"
                min={0}
                placeholder="Ej: 50"
                value={form.capacityMin ?? ""}
                onChange={(e) =>
                  setForm({ ...form, capacityMin: Number(e.target.value) || 0 })
                }
              />
            </div>

            <div className="form-group">
              <label>Capacidad máxima</label>
              <input
                type="number"
                min={0}
                placeholder="Ej: 120"
                value={form.capacityMax ?? ""}
                onChange={(e) =>
                  setForm({ ...form, capacityMax: Number(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="row">
            <label>Descripción</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Breve descripción del servicio"
            />
          </div>
        </div>
      </div>

      {/* Imágenes */}
      <div className="box">
        <h4 style={{ marginTop: 0 }}>Imágenes</h4>
        <p className="muted" style={{ marginTop: -6 }}>
          Se subirán y guardarán cuando presiones <b>Guardar</b>.
        </p>

        <div className="row" style={{ marginTop: 6 }}>
          <label>Agregar imágenes</label>
          <input type="file" multiple onChange={onPickFiles} />
        </div>

        {/* Previews de archivos NUEVOS (aún no subidos) */}
        {files.length > 0 && (
          <>
            <div className="muted" style={{ marginTop: 10 }}>Previsualizaciones:</div>
            <div className="image-grid">
              {files.map((f, i) => {
                const url = URL.createObjectURL(f);
                return (
                  <div className="image-card" key={`new-${i}`}>
                    <img src={url} alt={`nuevo-${i}`} />
                    <div className="image-actions">
                      <span className="badge-cover">Nuevo</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Imágenes existentes (solo edición) */}
        {!isNew && (
          <>
            <div className="muted" style={{ marginTop: 16 }}>Imágenes existentes</div>
            {(form.images || []).length === 0 && <p className="muted">No hay imágenes aún.</p>}

            <div className="image-grid">
              {(form.images || []).map((im) => {
                const imageId = im.imageId || im.id || im._id;
                const isCover = !!im.isCover;
                const src = resolveThumbSrc(im) || resolveThumbSrc(imageId);
                return (
                  <div className="image-card" key={imageId}>
                    <img
                      src={src}
                      alt={im.alt || ""}
                      onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                    />

                    <div className="image-actions">
                      {isCover ? (
                        <span className="badge-cover">Portada ✓</span>
                      ) : (
                        <button
                          className="btn btn-outline"
                          type="button"
                          onClick={() => makeCover(imageId)}
                          title="Establecer como portada"
                        >
                          Hacer portada
                        </button>
                      )}

                      <button
                        className="btn"
                        type="button"
                        onClick={() => removeImage(imageId)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
