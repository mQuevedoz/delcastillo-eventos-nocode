import { useEffect } from "react";

const ROLES = ["Toldero","Cocinero","Barman","Mozo","Sonido","Luz","Decoración","Transporte","Otros"];

export default function ProviderModal({ open, onClose, onSubmit, form, setForm, editing }) {
  useEffect(() => {
    function onEsc(e){ if(e.key === "Escape") onClose(); }
    if (open) {
      document.addEventListener("keydown", onEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  // --- estilos inline  ---
  const overlay = {
    position: "fixed", inset: 0, zIndex: 9999,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)", padding: "16px"
  };
  const card = {
    width: "100%", maxWidth: "720px", background: "#fff",
    borderRadius: "14px", boxShadow: "0 12px 40px rgba(0,0,0,.16)", overflow: "hidden",
    border: "1px solid rgba(0,0,0,.06)"
  };
  const header = { padding: "16px 24px", borderBottom: "1px solid #eee", position: "relative" };
  const h2 = { margin: 0, fontSize: "18px", fontWeight: 600 };
  const closeBtn = {
    position: "absolute", top: 10, right: 10, width: 36, height: 36,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    border: "1px solid #ddd", borderRadius: "999px", background: "#fff", cursor: "pointer"
  };
  const body = { padding: "20px 24px" };
  const grid = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px"
  };
  const full = { gridColumn: "1 / -1" };
  const label = { display: "block", fontSize: "13px", fontWeight: 600, marginBottom: 6 };
  const input = {
    width: "100%", padding: "10px 12px", borderRadius: "8px",
    border: "1px solid #dcdcdc", outline: "none"
  };
  const select = { ...input, background: "#fff" };
  const footer = {
    display: "flex", justifyContent: "flex-end", gap: "8px", padding: "0 24px 16px 24px"
  };
  const btn = {
    padding: "10px 14px", borderRadius: "10px", border: "1px solid #ddd", background: "#fff", cursor: "pointer"
  };
  const btnPrimary = {
    ...btn, background: "#F59E0B", borderColor: "#F59E0B", color: "#fff"
  };

  return (
    <div style={overlay} aria-modal="true" role="dialog">
      <form onSubmit={onSubmit} style={card}>
        <div style={header}>
          <h2 style={h2}>{editing ? "Editar proveedor" : "Nuevo proveedor"}</h2>
          <button type="button" onClick={onClose} style={closeBtn} aria-label="Cerrar" title="Cerrar">✕</button>
        </div>

        <div style={body}>
          <div style={grid}>
            <div style={full}>
              <label style={label}>Proveedor (contacto) *</label>
              <input
                style={input} required placeholder="Ej. Juan Pérez"
                value={form.name} onChange={e=>setForm({...form, name:e.target.value})}
              />
            </div>

            <div>
              <label style={label}>RUC (opcional)</label>
              <input
                style={input} placeholder="20123456789"
                value={form.ruc} onChange={e=>setForm({...form, ruc:e.target.value})}
              />
            </div>

            <div>
              <label style={label}>Cargo *</label>
              <select
                style={select} value={form.role}
                onChange={e=>setForm({...form, role:e.target.value})}
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label style={label}>Teléfono *</label>
              <input
                style={input} required placeholder="9XXXXXXXX"
                value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}
              />
            </div>

            <div>
              <label style={label}>Email</label>
              <input
                type="email" style={input} placeholder="correo@dominio.com"
                value={form.email} onChange={e=>setForm({...form, email:e.target.value})}
              />
            </div>
          </div>
        </div>

        <div style={footer}>
          <button type="button" onClick={onClose} style={btn}>Cancelar</button>
          <button style={btnPrimary}>{editing ? "Guardar" : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}
