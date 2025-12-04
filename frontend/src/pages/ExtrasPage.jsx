import { useEffect, useMemo, useState } from "react";
import { listExtras } from "../api/extras";
import ExtraCard from "../components/ExtraCard";
import ExtraPreviewModal from "../components/ExtraPreviewModal";

export default function ExtrasPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null); // extra seleccionado

  const fetchData = async () => {
    setLoading(true);
    const data = await listExtras(q);
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(fetchData, 250); // debounce para búsqueda
    return () => clearTimeout(t);
  }, [q]);

  const rows = useMemo(() => items, [items]);

  return (
    <>
      <section className="hero-wrap">
        <div className="hero">
          <div className="hero-inner">
            <h1>Servicios Extras</h1>
            <p className="hero-sub">
              Complementa tu evento con luces, hora loca, efectos y más. Cotiza fácil y rápido.
            </p>
          </div>
        </div>
      </section>

      <main className="container" id="extras-grid" style={{ marginTop: 24 }}>
        <h2>Catálogo de Extras</h2>
        <p className="muted">
          Los precios mostrados son referenciales y pueden variar según los requerimientos de cada cliente.
        </p>

        <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "10px 0 16px" }}>
          <input
            className="form-control"
            placeholder="Buscar por nombre o descripción…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ width: 320 }}
          />
        </div>

        {loading && <p>Cargando…</p>}

        {!loading && (
          <div className="grid grid-3">
            {rows.map((x) => (
              <ExtraCard key={x._id} extra={x} onOpen={() => setPreview(x)} />
            ))}
          </div>
        )}

        {!loading && !rows.length && (
          <div className="empty">No hay extras para mostrar.</div>
        )}
      </main>

      {preview && (
        <ExtraPreviewModal
          extra={preview}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}
