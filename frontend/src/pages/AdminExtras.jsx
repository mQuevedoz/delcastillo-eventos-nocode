import { useEffect, useMemo, useState } from "react";
import {
  adminListExtras as listExtras,
  adminCreateExtra as createExtra,
  adminUpdateExtra as updateExtra,
  adminDeleteExtra as deleteExtra,
  adminAddExtraImage as addExtraImage,
  adminSetExtraCover as setExtraCover,
} from "../api/adminExtras";
import ExtraModal from "../components/ExtraModal";
import { uploadImages, fileUrl } from "../api/adminServices";

const placeholder = "/corporativo1.jpg";

export default function AdminExtras() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const data = await listExtras(q);
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [q]);

  const rows = useMemo(() => items, [items]);

  const onSave = async (payload, files = [], selectedCoverId = null) => {
    try {
      let id = editing?._id || null;

      // crear o editar
      if (id) {
        await updateExtra(id, payload);
      } else {
        const created = await createExtra(payload);
        id = created?._id;
      }

      // ¿tenía imágenes previas?
      const before = items.find((it) => it._id === id);
      const hadImages = Array.isArray(before?.images) && before.images.length > 0;

      // subir y asociar nuevas
      if (id && files.length) {
        const uploaded = await uploadImages(files);
        for (let i = 0; i < uploaded.length; i++) {
          const u = uploaded[i];
          const url = fileUrl(u._id || u.id);
          await addExtraImage(id, { url, isCover: !hadImages && i === 0 });
        }
      }

      // fijar portada elegida
      if (id && selectedCoverId) {
        await setExtraCover(id, selectedCoverId);
      }
    } catch (err) {
      console.error("Error guardando extra:", err);
      alert("No se pudo guardar el extra. Revisa la consola para más detalles.");
    } finally {
      setEditing(null);
      fetchData();
    }
  };

  const onDelete = async (id) => {
    if (!confirm("¿Eliminar extra?")) return;
    await deleteExtra(id);
    fetchData();
  };

  return (
    <div className="page extras-page">
      <div className="page-header">
        <h2>Gestionar Servicios Extras</h2>
      </div>

      <div className="card extras-card">
        {/* Toolbar pegada a la tabla */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 14px 6px",
          }}
        >
          <input
            placeholder="Buscar por nombre o descripción…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="form-control"
            style={{ width: 320 }}
          />
          <button className="btn btn-primary" onClick={() => setEditing({})}>
            Nuevo extra
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Portada</th>
              <th>Nombre</th>
              <th>Precio (S/)</th>
              <th>Descripción</th>
              <th style={{ width: 160 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5}>Cargando…</td>
              </tr>
            )}

            {!loading &&
              rows.map((x) => (
                <tr key={x._id}>
                  <td>
                    <img
                      src={
                        x.images?.find((i) => i.isCover)?.url ||
                        x.images?.[0]?.url ||
                        placeholder
                      }
                      alt=""
                      style={{
                        width: 64,
                        height: 48,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  </td>
                  <td>{x.name}</td>
                  <td>{Number(x.price || 0).toFixed(2)}</td>
                  <td title={x.description}>
                    {x.description?.length > 60
                      ? x.description.slice(0, 60) + "…"
                      : x.description}
                  </td>
                  <td>
                    <div className="btn-group" style={{ gap: 8 }}>
                      <button
                        className="btn btn-light"
                        onClick={() => setEditing(x)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => onDelete(x._id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && !rows.length && (
              <tr>
                <td colSpan={5}>Sin resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <ExtraModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={onSave}
        />
      )}
    </div>
  );
}
