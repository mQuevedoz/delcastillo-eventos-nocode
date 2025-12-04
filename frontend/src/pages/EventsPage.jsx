// src/pages/EventsPage.jsx
//import React from "react";
import { useEffect, useMemo, useState } from "react";  
import { listEvents, createEvent, updateEvent, removeEvent } from "@/api/events";
import { listActiveCasas } from "@/api/casas";
import { listServices } from "@/api/services";
import EventsModal from "@/components/EventsModal.jsx";
//import AdminDashboard from "./AdminDashboard";




/* ========= Iconos (mismo estilo que Proveedores) ========= */
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


/* ========= Estilos inline (calcados de Proveedores) ========= */
const s = {
  wrapper: { display:"flex", justifyContent:"center", padding:"24px" },
  card: {
    width:"100%", maxWidth:980, background:"#fff", borderRadius:12,
    border:"1px solid #eee", boxShadow:"0 8px 24px rgba(0,0,0,.06)", padding:16
  },
  header: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 8px 12px 8px" },
  title: { fontSize:20, fontWeight:700, margin:0 },
  btnPrimary: {
    display:"inline-flex", alignItems:"center", gap:8, background:"#F59E0B",
    color:"#fff", padding:"10px 14px", borderRadius:10, border:"1px solid #F59E0B", cursor:"pointer"
  },
  searchRow: { display:"flex", alignItems:"center", gap:12, padding:"0 8px 12px 8px" },
  searchWrap: { display:"flex", alignItems:"center", gap:8, padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:10, width:260, background:"#fff" },
  searchInput: { border:"none", outline:"none", width:"100%", fontSize:14 },
  tableWrap: { border:"1px solid #eee", borderRadius:10, overflow:"hidden", marginTop:12 },
  th: { textAlign:"left", padding:"12px 12px", fontWeight:600, fontSize:14, background:"#f9fafb" },
  td: { padding:"12px 12px", fontSize:14, verticalAlign:"top", borderTop:"1px solid #f1f5f9" },
  actions: { display:"flex", gap:8, alignItems:"center" },
  btnIcon: (bg="#fff", brd="#e5e7eb") => ({
    width:32, height:32, display:"inline-flex", alignItems:"center", justifyContent:"center",
    borderRadius:8, background:bg, border:`1px solid ${brd}`, cursor:"pointer"
  }),
  
  badgeWarn: {
    marginLeft:8, fontSize:11, padding:"4px 8px", borderRadius:999,
    background:"#fff7ed", color:"#c2410c", border:"1px solid #fed7aa"
  }
};

export default function EventsPage() {
  /* ===== tabla ===== */
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  /* ===== catálogos ===== */
  const [services, setServices] = useState([]);
  const [casas, setCasas] = useState([]);

  /* ===== modal / form ===== */
  const empty = { contratante:"", telefono:"", serviceId:"", casaId:"", date:"", price:0, status:"programado", notes:"" };
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const total = useMemo(()=> rows.reduce((a,r)=>a+(r.price||0),0), [rows]);
  
    async function fetchRows() {
    setLoading(true);
    try {
      const data = await listEvents({ q });
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows();
    listServices().then(setServices);
    listActiveCasas().then(setCasas); // SOLO activas
  }, []); // eslint-disable-line

  function openNew() {
    setForm(empty);
    setEditingId(null);
    setOpen(true);
  }
  function openEdit(r) {
    setForm({
      contratante: r.contratante || "",
      telefono: r.telefono || "",
      serviceId: typeof r.serviceId === "object" ? r.serviceId?._id : r.serviceId || "",
      casaId: typeof r.casaId === "object" ? r.casaId?._id : r.casaId || "",
      date: r.date || "",
      price: Number(r.price || 0),
      status: r.status || "programado",
      notes: r.notes || "",
    });
    setEditingId(r._id);
    setOpen(true);
  }

  async function submit() {
    if (editingId) await updateEvent(editingId, form);
    else await createEvent(form);
    setOpen(false);
    setEditingId(null);
    setForm(empty);
    await fetchRows();
  }

  async function removeRow(id) {
    if (!confirm("¿Eliminar evento?")) return;
    await removeEvent(id);
    await fetchRows();
  }

  const isCasaActivaHoy = (row) => {
    const id = typeof row.casaId === "object" ? row.casaId?._id : row.casaId;
    return casas.some((c) => c._id === id);
  };

  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <h1 style={s.title}>Gestión de Eventos</h1>
          <button onClick={openNew} style={s.btnPrimary}>
            <IconPlus /> <span>Nuevo Evento</span>
          </button>
        </div>

        {/* Buscador */}
        <div style={s.searchRow}>
          <div style={s.searchWrap}>
            <IconSearch />
            <input
              style={s.searchInput}
              placeholder="Buscar (contratante, teléfono, notas...)"
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              onKeyDown={(e)=> e.key==='Enter' && fetchRows()}
            />
          </div>
          <button
            onClick={fetchRows}
            style={{ padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:10, background:"#fff", cursor:"pointer" }}
          >
            Buscar
          </button>
        </div>

        {/* Tabla */}
        {loading ? (
          <div style={{ padding:16 }}>Cargando...</div>
        ) : (
          <div style={s.tableWrap}>
            <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0 }}>
              <thead>
                <tr>
                  <th style={s.th}> Contratante</th>
                  <th style={s.th}>Telefono</th>
                  <th style={s.th}>Categoría</th>
                  <th style={s.th}>Local</th>
                  <th style={s.th}>Fecha</th>
                  <th style={s.th}>Ganancia</th>
                  <th style={s.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const categoria = typeof r.serviceId === "object" ? r.serviceId?.category : "-";
                  const casaNombre = typeof r.casaId === "object" ? r.casaId?.nombre : "-";
                  const casaActiva = isCasaActivaHoy(r);

                  return (
                    <tr key={r._id}>
                      {/* Contratante */}
                      <td style={s.td}>
                        <div style={{ fontWeight:600 }}>{r.contratante}</div>
                      </td>

                      {/* Telefono */}
                      <td style={s.td}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                          <span>{r.telefono || "-"}</span>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td style={s.td}>{categoria || "-"}</td>

                      {/* Local */}
                      <td style={s.td}>
                        {casaNombre}
                        {!casaActiva && <span style={s.badgeWarn}>inactiva</span>}
                      </td>

                      {/* Fecha */}
                      <td style={s.td}>{r.date}</td>

                      {/* Ganancia */}
                      <td style={s.td}>S/ {(r.price || 0).toFixed(2)}</td>

                      {/* Acciones */}
                      <td style={s.td}>
                        <div style={s.actions}>
                          <button onClick={()=>openEdit(r)} style={s.btnIcon("#fff","#f5d0a0")} title="Editar">
                            <IconEdit />
                          </button>
                          <button onClick={()=>removeRow(r._id)} style={s.btnIcon("#fff","#f5d0a0")} title="Eliminar">
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr><td colSpan={7} style={{ padding:16, textAlign:"center", color:"#6b7280" }}>Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:12, fontSize:13, color:"#6b7280" }}>
          Mostrando <b>{rows.length}</b> registros · Total: <b>S/ {total.toFixed(2)}</b>
          {/*<AdminDashboard total={total} /> */}
        </div>
      </div>

      {/* MODAL de Eventos (igual patrón que ProviderModal) */}
      <EventsModal
        open={open}
        onClose={()=>{ setOpen(false); setEditingId(null); setForm(empty); }}
        onSubmit={submit}
        form={form}
        setForm={setForm}
        services={services}
        casas={casas}
        editing={!!editingId}
      />
    </div>
  );
}

