// src/components/EventsModal.jsx
import { useEffect, useMemo } from "react";

const ESTADOS = ["programado", "en_proceso", "completado", "cancelado"];

export default function EventsModal({
  open,
  onClose,
  onSubmit,       // callback del padre
  form = {},      // { contratante, telefono, serviceId, casaId, date, price, status, notes }
  setForm,
  services = [],  // [{_id, name, category}]
  casas = [],     // [{_id, nombre}] SOLO activas
  editing = false
}) {
  // 1) Hooks SIEMPRE en el mismo orden/cantidad
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    if (open) {
      document.addEventListener("keydown", onEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // useMemo: siempre se ejecuta (aunque luego no rendericemos el modal)
  const currentService = useMemo(
    () => services.find((s) => s._id === form.serviceId),
    [services, form.serviceId]
  );
  const currentCategory = currentService?.category || "-";
  const casaEsValida = useMemo(
    () => casas.some((c) => c._id === form.casaId),
    [casas, form.casaId]
  );

  // 2) Recién aquí hacemos el return temprano
  if (!open) return null;

  // --- estilos (idénticos a ProviderModal) ---
  const overlay = {
    position: "fixed", inset: 0, zIndex: 9999,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)", padding: 16
  };
  const card = {
    width: "100%", maxWidth: 720, background: "#fff",
    borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,.16)", overflow: "hidden",
    border: "1px solid rgba(0,0,0,.06)"
  };
  const header = { padding: "16px 24px", borderBottom: "1px solid #eee", position: "relative" };
  const h2 = { margin: 0, fontSize: 18, fontWeight: 600 };
  const closeBtn = {
    position: "absolute", top: 10, right: 10, width: 36, height: 36,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    border: "1px solid #ddd", borderRadius: 999, background: "#fff", cursor: "pointer"
  };
  const body = { padding: "20px 24px" };
  const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
  const full = { gridColumn: "1 / -1" };
  const label = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 };
  const input = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #dcdcdc", outline: "none" };
  const select = { ...input, background: "#fff" };
  const footer = { display: "flex", justifyContent: "flex-end", gap: 8, padding: "0 24px 16px 24px" };
  const btn = { padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer" };
  const btnPrimary = { ...btn, background: "#F59E0B", borderColor: "#F59E0B", color: "#fff" };
  const warn = { marginTop: 4, fontSize: 12, color: "#c2410c" };

  // handlers
  const set = (patch) => setForm((s) => ({ ...s, ...patch }));
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.contratante?.trim()) return alert("El campo Contratante es obligatorio.");
    if (!form.date) return alert("La Fecha es obligatoria.");
    if (!form.serviceId) return alert("Selecciona un Servicio.");
    if (!form.casaId) return alert("Selecciona un Local.");
    if (!casaEsValida) return alert("El Local seleccionado está inactivo. Elige una Casa activa.");
    onSubmit();
  };

  return (
    <div style={overlay} aria-modal="true" role="dialog">
      <form onSubmit={handleSubmit} style={card}>
        <div style={header}>
          <h2 style={h2}>{editing ? "Editar evento" : "Nuevo evento"}</h2>
          <button type="button" onClick={onClose} style={closeBtn} aria-label="Cerrar" title="Cerrar">✕</button>
        </div>

        <div style={body}>
          <div style={grid}>
            {/* Contratante / Teléfono */}
            <div style={full}>
              <label style={label}>Contratante *</label>
              <input
                style={input} required placeholder="Ej. Juan Pérez"
                value={form.contratante || ""} onChange={(e)=>set({ contratante: e.target.value })}
              />
            </div>
            <div>
              <label style={label}>Teléfono</label>
              <input
                style={input} placeholder="9XXXXXXXX"
                value={form.telefono || ""} onChange={(e)=>set({ telefono: e.target.value })}
              />
            </div>

            {/* Servicio / Categoría / Local */}
            <div>
              <label style={label}>Servicio *</label>
              <select style={select} value={form.serviceId || ""} onChange={(e)=>set({ serviceId: e.target.value })} required>
                <option value="">Selecciona</option>
                {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Categoría</label>
              <input style={{...input, background:"#fafafa"}} value={currentCategory} readOnly />
            </div>
            <div>
              <label style={label}>Local (Casa) *</label>
              <select style={select} value={form.casaId || ""} onChange={(e)=>set({ casaId: e.target.value })} required>
                <option value="">Selecciona</option>
                {casas.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
              </select>
              {form.casaId && !casaEsValida && (
                <div style={warn}>El Local actual está inactivo. Elige una Casa activa para guardar.</div>
              )}
            </div>

            {/* Fecha / Ganancia / Estado */}
            <div>
              <label style={label}>Fecha *</label>
              <input type="date" style={input} value={form.date || ""} onChange={(e)=>set({ date: e.target.value })} required />
            </div>
            <div>
              <label style={label}>Ganancia (S/.)</label>
              <input type="number" step="0.01" style={input}
                     placeholder="0.00" value={form.price ?? 0}
                     onChange={(e)=>set({ price: Number(e.target.value) })}/>
            </div>
            <div>
              <label style={label}>Estado</label>
              <select style={select} value={form.status || "programado"} onChange={(e)=>set({ status: e.target.value })}>
                {ESTADOS.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            </div>

            {/* Notas */}
            <div style={full}>
              <label style={label}>Notas</label>
              <input style={input} placeholder="Detalles adicionales"
                     value={form.notes || ""} onChange={(e)=>set({ notes: e.target.value })}/>
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
