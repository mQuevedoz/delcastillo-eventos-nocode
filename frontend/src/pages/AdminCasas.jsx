// src/pages/AdminCasas.jsx
import { useEffect, useState } from "react";
import {
  listarCasas,
  crearCasa,
  actualizarCasa,
  eliminarCasa,
  addCasaImages,
  setCoverCasa,
} from "../api/casas";
import CasaModal from "../components/CasaModal";

export default function AdminCasas() {
  const [casas, setCasas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);

  async function cargarCasas() {
    setLoading(true);
    try {
      const data = await listarCasas(busqueda);
      setCasas(data);
    } catch (err) {
      console.error(err);
      alert("Error al cargar casas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargarCasas(); }, [busqueda]);

  const handleNuevaCasa = () => { setEditando(null); setMostrarModal(true); };
  const handleEditar = (casa) => { setEditando(casa); setMostrarModal(true); };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar esta casa de forma definitiva?")) return;
    try {
      await eliminarCasa(id);
      cargarCasas();
    } catch {
      alert("Error eliminando casa");
    }
  };

  // onSave recibe (form, filesToUpload)
  const handleGuardar = async (form, files = []) => {
    try {
      let saved;
      if (editando) {
        saved = await actualizarCasa(editando._id, form);
        if (files.length) {
          const fd = new FormData();
          for (const f of files) fd.append("files", f);
          await addCasaImages(saved._id, fd);
        }
      } else {
        saved = await crearCasa(form);
        if (files.length) {
          const fd = new FormData();
          for (const f of files) fd.append("files", f);
          const resp = await addCasaImages(saved._id, fd);
          const firstId = resp?.uploaded?.[0]?.publicId || resp?.uploaded?.[0]?.publicId || resp?.uploaded?.[0]?.id;
          if (firstId) await setCoverCasa(saved._id, firstId);
        }
      }
      setMostrarModal(false);
      cargarCasas();
    } catch (err) {
      console.error(err);
      alert(err?.message ||"Error guardando casa");
    }
  };

  return (
    <div className="container page-content">
      <div className="header">
        <input
          type="text"
          placeholder="Buscar casas..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div className="filters">
          <button className="btn-primary" onClick={handleNuevaCasa}>+ Nueva Casa</button>
        </div>
      </div>

      {loading && <p>Cargando...</p>}

      <div className="grid">
        {casas.map((casa) => {
          const cover = casa.imagenes?.find(im => im.isCover) || casa.imagenes?.[0];
          const src = cover?.thumb || cover?.url;
          return (
            <div key={casa._id} className="card">
              <div className="card-img">
                {src ? <img src={src} alt={casa.nombre} /> : <div className="placeholder">Sin imagen</div>}
              </div>
              <div className="card-body">
                <h3>{casa.nombre}</h3>
                <p className="muted">{casa.direccion}</p>
                <p className="price">S/. {casa.precioDesde ?? 0}</p>

                <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input type="checkbox" checked={!!casa.activa}
                    onChange={() => actualizarCasa(casa._id, { activa: !casa.activa }).then(cargarCasas)} />
                  {casa.activa ? "Activo" : "Inactivo"}
                </label>

                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button className="btn-outline" onClick={() => handleEditar(casa)}>✏️ Editar</button>
                  <button className="btn" onClick={() => handleEliminar(casa._id)}>🗑 Eliminar</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {mostrarModal && (
        <CasaModal
          casa={editando}
          onClose={() => setMostrarModal(false)}
          onSave={handleGuardar}
        />
      )}
    </div>
  );
}
