// src/pages/AdminServicios.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  adminListServices,
  adminDeleteService,
  resolveThumbSrc,
} from "../api/adminServices";

const clamp = (s = "", n = 60) => (s.length > n ? s.slice(0, n) + "…" : s);

export default function AdminServicios() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function load() {
    try {
      setErr("");
      setLoading(true);
      const data = await adminListServices();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error listando");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onDelete(id) {
    if (!confirm("¿Eliminar este servicio?")) return;
    await adminDeleteService(id);
    load();
  }

  return (
    <div className="container page-content">
      <div className="header" style={{ marginBottom: 12 }}>
        <h2 className="page-title m-0">Gestionar servicios</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/servicios/nuevo")}
        >
          Nuevo servicio
        </button>
      </div>

      {loading && <p>Cargando…</p>}
      {err && <div className="alert alert-danger">{err}</div>}

      {!loading && !err && (
        <div className="box" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Portada</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th style={{ minWidth: 120 }}>Capacidad</th>
                <th>Descripción</th>
                <th style={{ width: 220 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => {
                const imgs = Array.isArray(s.images) ? s.images : [];
                // cover puede venir como string, {imageId}, {_id}, {id} o {url}
                const cover =
                  imgs.find((i) => (i?.isCover ? true : false)) || imgs[0];
                const coverSrc = resolveThumbSrc(cover);

                return (
                  <tr key={s._id}>
                    <td>
                      {coverSrc ? (
                        <img
                          src={coverSrc}
                          alt=""
                          style={{
                            width: 72,
                            height: 54,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 72,
                            height: 54,
                            background: "#f2f2f2",
                            borderRadius: 6,
                          }}
                        />
                      )}
                    </td>
                    <td>{s.name}</td>
                    <td>{s.category}</td>
                    <td>
                      {(s.capacityMin ?? "-")}–{s.capacityMax ?? "-"}
                    </td>
                    <td>{clamp(s.description || "", 55)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link
                          className="btn btn-outline"
                          to={`/admin/servicios/${s._id}`}
                        >
                          Editar
                        </Link>
                        <button className="btn" onClick={() => onDelete(s._id)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6}>Sin registros</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
