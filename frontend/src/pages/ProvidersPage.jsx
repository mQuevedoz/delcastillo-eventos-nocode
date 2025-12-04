import { useEffect, useState } from "react";
import { listProviders, createProvider, updateProvider, deleteProvider } from "@/api/providers";
import ProviderModal from "@/components/ProviderModal.jsx";

// normaliza número para wa.me
function toWaNumber(raw) {
  if (!raw) return "";
  const digits = (""+raw).replace(/\D/g, "");
  if (digits.length === 9) return `51${digits}`;
  return digits;
}

// ====== Iconos (SVG inline) ======
const IconSearch = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <circle cx="11" cy="11" r="8" strokeWidth="2"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2"></line>
  </svg>
);
const IconPlus = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2"></line>
    <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2"></line>
  </svg>
);
const IconEdit = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path d="M12 20h9" strokeWidth="2" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" strokeWidth="2" />
  </svg>
);
const IconTrash = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <polyline points="3 6 5 6 21 6" strokeWidth="2"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeWidth="2"/>
    <path d="M10 11v6M14 11v6" strokeWidth="2"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" strokeWidth="2"/>
  </svg>
);
const IconWhatsApp = (props) => (
  <svg width="14" height="14" viewBox="0 0 32 32" {...props}>
    <path fill="#25D366" d="M19.11 17.43c-.31-.16-1.83-.9-2.11-1.01-.28-.1-.48-.16-.68.16-.2.31-.78 1.01-.96 1.22-.18.2-.36.23-.67.08-.31-.16-1.3-.47-2.48-1.5-.92-.82-1.54-1.84-1.72-2.15-.18-.31-.02-.47.14-.63.14-.14.31-.36.47-.54.16-.18.2-.31.31-.52.1-.2.05-.39-.03-.54-.08-.16-.68-1.64-.94-2.25-.24-.58-.48-.5-.68-.5h-.58c-.2 0-.52.08-.79.39-.28.31-1.04 1.01-1.04 2.46 0 1.45 1.07 2.86 1.22 3.06.16.2 2.12 3.24 5.13 4.54.72.31 1.28.49 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.83-.75 2.09-1.48.26-.73.26-1.36.18-1.49-.08-.12-.28-.2-.59-.35z"/>
    <path fill="#25D366" d="M16.02 3.2C9.54 3.2 4.3 8.43 4.3 14.9c0 2.57.86 4.95 2.31 6.86L5 28.79l7.22-1.89c1.85 1.01 3.98 1.59 6.25 1.59 6.48 0 11.72-5.23 11.72-11.7 0-6.47-5.24-11.71-11.72-11.71zm0 21.37c-2.12 0-4.08-.63-5.72-1.72l-.41-.26-4.28 1.12 1.15-4.17-.27-.43a9.67 9.67 0 01-1.53-5.14c0-5.37 4.37-9.73 9.75-9.73 5.37 0 9.75 4.36 9.75 9.73 0 5.36-4.38 9.73-9.75 9.73z"/>
  </svg>
);

export default function ProvidersPage() {
  // ===== estilos rápidos para la “tarjeta centrada” =====
  const wrapper = { display:"flex", justifyContent:"center", padding:"24px" };
  const card = {
    width: "100%", maxWidth: 980, background:"#fff", borderRadius: 12,
    border:"1px solid #eee", boxShadow:"0 8px 24px rgba(0,0,0,.06)", padding: 16
  };
  const header = { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 8px 12px 8px" };
  const title = { fontSize: 20, fontWeight: 700, margin: 0 };
  const btnPrimary = {
    display:"inline-flex", alignItems:"center", gap:8, background:"#F59E0B",
    color:"#fff", padding:"10px 14px", borderRadius:10, border:"1px solid #F59E0B", cursor:"pointer"
  };
  const searchWrap = { display:"flex", alignItems:"center", gap:8, padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius: 10, width: 260, background:"#fff" };
  const searchInput = { border:"none", outline:"none", width:"100%", fontSize:14 };
  const tableWrap = { border:"1px solid #eee", borderRadius: 10, overflow:"hidden", marginTop: 12 };
  const th = { textAlign:"left", padding:"12px 12px", fontWeight:600, fontSize:14, background:"#f9fafb" };
  const td = { padding:"12px 12px", fontSize:14, verticalAlign:"top", borderTop:"1px solid #f1f5f9" };
  const actions = { display:"flex", gap:8, alignItems:"center" };
  const btnIcon = (bg="#fff", brd="#e5e7eb") => ({
    width:32, height:32, display:"inline-flex", alignItems:"center", justifyContent:"center",
    borderRadius:8, background:bg, border:`1px solid ${brd}`, cursor:"pointer"
  });
  const chipWA = {
    display:"inline-flex", alignItems:"center", gap:6,
    border:"1px solid #d1fae5", background:"#ecfdf5",
    padding:"6px 10px", borderRadius:999, textDecoration:"none", color:"#065f46", fontSize:13
  };

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  const empty = { name: "", ruc: "", role: "Toldero", phone: "", email: "" };
  const [form, setForm] = useState(empty);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function fetchData() {
    setLoading(true);
    const { data } = await listProviders(q);
    setItems(data);
    setLoading(false);
  }
  useEffect(() => { fetchData(); }, []);

  function validate() {
    if (!form.name.trim()) return "El campo Proveedor es obligatorio.";
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 9) return "Teléfono inválido (mínimo 9 dígitos).";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Email inválido.";
    return null;
  }

  function openNew() { setForm(empty); setEditingId(null); setOpenModal(true); }
  function openEdit(p) {
    setForm({ name: p.name||"", ruc: p.ruc||"", role: p.role||"Toldero", phone: p.phone||"", email: p.email||"" });
    setEditingId(p._id);
    setOpenModal(true);
  }

  async function submit(e) {
    e.preventDefault();
    const err = validate(); if (err) return alert(err);
    if (editingId) await updateProvider(editingId, form);
    else await createProvider(form);
    setOpenModal(false); setEditingId(null); setForm(empty);
    await fetchData();
  }

  async function remove(id) {
    if (!confirm("¿Eliminar proveedor?")) return;
    await deleteProvider(id);
    await fetchData();
  }

  return (
    <div style={wrapper}>
      <div style={card}>
        {/* Header */}
        <div style={header}>
          <h1 style={title}>Gestión de Proveedores</h1>
          <button onClick={openNew} style={btnPrimary}>
            <IconPlus /> <span>Nuevo Proveedor</span>
          </button>
        </div>

        {/* Buscador */}
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"0 8px 12px 8px" }}>
          <div style={searchWrap}>
            <IconSearch />
            <input
              style={searchInput}
              placeholder="Buscar (nombre, RUC, cargo...)"
              value={q} onChange={e=>setQ(e.target.value)}
              onKeyDown={(e)=>{ if(e.key==='Enter') fetchData(); }}
            />
          </div>
          <button onClick={fetchData} style={{ padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:10, background:"#fff", cursor:"pointer" }}>
            Buscar
          </button>
        </div>

        {/* Tabla */}
        {loading ? (
          <div style={{ padding:16 }}>Cargando...</div>
        ) : (
          <div style={tableWrap}>
            <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0 }}>
              <thead>
                <tr>
                  <th style={th}>Cliente / Proveedor</th>
                  <th style={th}>RUC</th>
                  <th style={th}>Cargo</th>
                  <th style={th}>Contacto</th>
                  <th style={th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map(p => (
                  <tr key={p._id}>
                    <td style={td}>
                      <div style={{ fontWeight:600 }}>{p.name}</div>
                      {p.email && <div style={{ color:"#6b7280", fontSize:13 }}>{p.email}</div>}
                    </td>
                    <td style={td}>{p.ruc || "-"}</td>
                    <td style={td}>{p.role}</td>
                    <td style={td}>
                      <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                        <span>{p.phone}</span>
                        {p.phone && (
                          <a
                            href={`https://wa.me/${toWaNumber(p.phone)}?text=${encodeURIComponent("Hola, te contacto para coordinar servicio.")}`}
                            target="_blank" rel="noopener noreferrer"
                            style={chipWA}
                            title="Enviar WhatsApp"
                          >
                            <IconWhatsApp />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </td>
                    <td style={td}>
                      <div style={actions}>
                        <button onClick={()=>openEdit(p)} style={btnIcon("#fff","#f5d0a0")} title="Editar">
                          <IconEdit />
                        </button>
                        <button onClick={()=>remove(p._id)} style={btnIcon("#fff","#f5d0a0")} title="Eliminar">
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} style={{ padding:16, textAlign:"center", color:"#6b7280" }}>Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      <ProviderModal
        open={openModal}
        onClose={()=>{ setOpenModal(false); setEditingId(null); }}
        onSubmit={submit}
        form={form}
        setForm={setForm}
        editing={!!editingId}
      />
    </div>
  );
}
