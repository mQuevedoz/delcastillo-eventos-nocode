// src/pages/AdminUsuarios.jsx
import { useEffect, useState } from "react";
import {
  listUsers, createUser, updateUser, updatePassword, deleteUser,
} from "../api/users.js";

export default function AdminUsuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "edit" | "password"
  const [current, setCurrent] = useState(null); // usuario seleccionado para editar/cambiar pwd
  const [submitting, setSubmitting] = useState(false);

  // nuevo estado para confirmación de eliminación
  const [confirmDelete, setConfirmDelete] = useState(null); // { _id, nombre, apellido }
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", telefono: "", username: "", password: "",
  });
  const [pwd, setPwd] = useState("");

  const resetForm = () => {
    setForm({ nombre: "", apellido: "", email: "", telefono: "", username: "", password: "" });
    setPwd("");
    setCurrent(null);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // open modals
  const openCreate = () => { resetForm(); setMode("create"); setOpen(true); };
  const openEdit = (u) => { setCurrent(u); setForm({ ...u, password: "" }); setMode("edit"); setOpen(true); };
  const openPassword = (u) => { setCurrent(u); setPwd(""); setMode("password"); setOpen(true); };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "password") {
        if (pwd.length < 6) return alert("La contraseña debe tener al menos 6 caracteres");
        await updatePassword(current._id, pwd);
      } else if (mode === "edit") {
        const { password, ...payload } = form;
        await updateUser(current._id, payload);
      } else {
        if (form.password.length < 6) return alert("La contraseña debe tener al menos 6 caracteres");
        await createUser(form);
      }
      setOpen(false);
      await load();
    } catch (err) {
      alert(err.message || "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  // nueva función para manejar eliminación
  const handleDelete = async () => {
    if (!confirmDelete) return;
    
    setDeleting(true);
    try {
      await deleteUser(confirmDelete._id);
      await load();
      setConfirmDelete(null);
    } catch (err) {
      alert(err.message || "Error eliminando usuario");
    } finally {
      setDeleting(false);
    }
  };

  // función para abrir confirmación de eliminación
  const openDeleteConfirm = (u) => {
    setConfirmDelete({
      _id: u._id,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email
    });
  };

  // función para cancelar eliminación
  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  return (
    <div className="container page-content">
      <div className="header mb-2">
        <h2 className="section-title" style={{ margin: 0 }}>Administrar usuarios</h2>
        <button className="btn-primary" onClick={openCreate}>Nuevo usuario</button>
      </div>

      <div className="box">
        {loading ? (
          <p className="muted">Cargando…</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Usuario</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan="6" className="muted">Sin usuarios</td></tr>
              )}
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.nombre}</td>
                  <td>{u.apellido}</td>
                  <td>{u.email}</td>
                  <td>{u.telefono || "-"}</td>
                  <td>{u.username}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-xs" onClick={() => openEdit(u)}>Editar</button>
                    <button className="btn btn-xs" onClick={() => openPassword(u)}>Contraseña</button>
                    <button 
                      className="btn btn-xs" 
                      style={{ background: "#ff6b6b" }} 
                      onClick={() => openDeleteConfirm(u)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de confirmación de eliminación - Diseño mejorado */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="form-header" style={{ 
              borderBottom: "1px solid #e0e0e0", 
              paddingBottom: "15px",
              marginBottom: "20px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#fff2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #ff6b6b"
                }}>
                  <span style={{ 
                    color: "#ff6b6b", 
                    fontSize: "20px", 
                    fontWeight: "bold" 
                  }}>!</span>
                </div>
                <div>
                  <h3 className="section-title" style={{ 
                    margin: 0, 
                    color: "#ff6b6b",
                    fontSize: "1.2em"
                  }}>
                    Confirmar eliminación
                  </h3>
                  <p className="muted" style={{ margin: "2px 0 0 0", fontSize: "0.9em" }}>
                    {confirmDelete.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="form-card" style={{ padding: "0" }}>
              <div style={{ 
                padding: "0 20px 20px 20px",
                marginBottom: "0"
              }}>
                <p style={{ 
                  margin: "0 0 15px 0", 
                  lineHeight: "1.6",
                  fontSize: "1em"
                }}>
                  ¿Está seguro que desea eliminar al usuario <strong>{confirmDelete.nombre} {confirmDelete.apellido}</strong>?
                </p>
                <p style={{ 
                  margin: "0 0 20px 0", 
                  lineHeight: "1.5",
                  fontSize: "0.95em",
                  color: "#666",
                  padding: "12px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  borderLeft: "4px solid #ff6b6b"
                }}>
                  <strong>Advertencia:</strong> Esta acción eliminará permanentemente al usuario y todos sus datos asociados. Esta operación no se puede deshacer.
                </p>
              </div>

              <div className="form-actions" style={{ 
                marginTop: "0",
                paddingTop: "20px",
                borderTop: "1px solid #f0f0f0"
              }}>
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={cancelDelete} 
                  disabled={deleting}
                  style={{
                    minWidth: "100px"
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="btn" 
                  style={{ 
                    background: "#ff6b6b", 
                    color: "white",
                    minWidth: "150px",
                    fontWeight: "500"
                  }} 
                  onClick={handleDelete} 
                  disabled={deleting}
                >
                  {deleting ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <span className="spinner" style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid transparent",
                        borderTop: "2px solid currentColor",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        display: "inline-block"
                      }}></span>
                      Eliminando...
                    </span>
                  ) : (
                    "Eliminar permanentemente"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal existente */}
      {open && (
        <div className="modal-overlay" onClick={() => !submitting && setOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h3 className="section-title" style={{ margin: 0 }}>
                {mode === "create" && "Nuevo usuario"}
                {mode === "edit" && "Editar usuario"}
                {mode === "password" && `Cambiar contraseña de ${current?.nombre}`}
              </h3>
            </div>

            <form className="form-card" onSubmit={onSubmit}>
              {mode !== "password" ? (
                <>
                  <div className="form-grid two">
                    <div className="field">
                      <label>Nombre</label>
                      <input
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Apellido</label>
                      <input
                        value={form.apellido}
                        onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid two">
                    <div className="field">
                      <label>Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Teléfono</label>
                      <input
                        value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        placeholder="Opcional"
                      />
                    </div>
                  </div>

                  <div className="form-grid two">
                    <div className="field">
                      <label>Usuario</label>
                      <input
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        required
                      />
                    </div>
                    {mode === "create" && (
                      <div className="field">
                        <label>Contraseña</label>
                        <input
                          type="password"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          placeholder="Mínimo 6 caracteres"
                          required
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="field">
                  <label>Nueva contraseña</label>
                  <input
                    type="password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => setOpen(false)} disabled={submitting}>
                  Cancelar
                </button>
                <button className="btn-primary" type="submit" disabled={submitting}>
                  {submitting ? "Guardando…" :
                    mode === "password" ? "Actualizar contraseña" :
                      mode === "edit" ? "Guardar cambios" : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}