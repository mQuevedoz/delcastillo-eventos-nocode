import React, { useEffect, useState } from "react";
import { updateLeadStatus, deleteLead } from "../api/services";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  "No atendido",
  "Atendido", 
  "Contratado",
  "No contratado"
];

const STATUS_COLORS = {
  "No atendido": "#ff6b6b",
  "Atendido": "#4d96ff", 
  "Contratado": "#51cf66",
  "No contratado": "#868e96"
};

export default function AdminSolicitudes() {
  const [leads, setLeads] = useState([]);
  const [leadPage, setLeadPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = () => {
    setLoading(true);
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => setLeads(data || []))
      .catch((err) => {
        console.error("Error fetching leads", err);
        setLeads([]);
      })
      .finally(() => setLoading(false));
  };

  const open = (lead) => {
    setSelected(lead);
  };

  const close = () => setSelected(null);

  const handleStatusChange = async (leadId, newStatus) => {
    setUpdatingStatus(leadId);
    try {
      const updatedLead = await updateLeadStatus(leadId, newStatus);
      setLeads(prev => prev.map(lead => 
        lead._id === leadId ? updatedLead : lead
      ));
      
      // Actualizar también en el modal si está abierto
      if (selected && selected._id === leadId) {
        setSelected(updatedLead);
      }
    } catch (err) {
      alert("Error al actualizar estado: " + err.message);
      console.error("Error updating status:", err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteClick = (lead) => {
    setDeleteConfirm(lead);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteLead(deleteConfirm._id);
      setLeads(prev => prev.filter(lead => lead._id !== deleteConfirm._id));
      
      // Cerrar modal si está abierto
      if (selected && selected._id === deleteConfirm._id) {
        setSelected(null);
      }
      
      setDeleteConfirm(null);
    } catch (err) {
      alert("Error al eliminar solicitud: " + err.message);
      console.error("Error deleting lead:", err);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <div className="container page-content">
      <h1 className="page-title">Gestionar Solicitudes</h1>

      <div className="box mt-6" style={{ marginBottom: 32 }}>
        <h2 className="section-title">Últimas Solicitudes de Información</h2>

        {loading ? (
          <p className="muted">Cargando...</p>
        ) : leads.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Servicio</th>
                  <th>Fecha Evento</th>
                  <th>Fecha Solicitud</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {leads
                  .slice()
                  .reverse()
                  .slice(leadPage * PAGE_SIZE, leadPage * PAGE_SIZE + PAGE_SIZE)
                  .map((lead) => (
                    <tr key={lead._id}>
                      <td>{lead.name}</td>
                      <td>{lead.email}</td>
                      <td>{lead.serviceId?.name || "—"}</td>
                      <td>{lead.eventDate || "—"}</td>
                      <td>{new Date(lead.createdAt).toLocaleString()}</td>
                      <td>
                        <select
                          value={lead.status || "No atendido"}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          disabled={updatingStatus === lead._id}
                          style={{
                            background: STATUS_COLORS[lead.status || "No atendido"],
                            color: "white",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: 4,
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: updatingStatus === lead._id ? "not-allowed" : "pointer",
                            opacity: updatingStatus === lead._id ? 0.6 : 1,
                            minWidth: "120px"
                          }}
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option 
                              key={status} 
                              value={status} 
                              style={{ 
                                color: "black", 
                                background: "white",
                                padding: "6px"
                              }}
                            >
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            onClick={() => open(lead)}
                            style={{
                              background: "#4D96FF",
                              color: "white",
                              border: "none",
                              padding: "6px 10px",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => handleDeleteClick(lead)}
                            style={{
                              background: "#ff6b6b",
                              color: "white", 
                              border: "none",
                              padding: "6px 10px",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <span style={{ color: "#FF6B6B", fontWeight: "bold" }}>Total: {leads.length}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setLeadPage((p) => Math.max(0, p - 1))}
                  disabled={leadPage === 0}
                  style={{
                    background: "#FF6B6B",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    padding: "4px 12px",
                    cursor: leadPage === 0 ? "not-allowed" : "pointer",
                    opacity: leadPage === 0 ? 0.5 : 1,
                  }}
                >
                  &lt;
                </button>
                <span style={{ margin: "0 8px", color: "#333", fontWeight: 500 }}>{leadPage + 1} / {Math.max(1, Math.ceil(leads.length / PAGE_SIZE))}</span>
                <button
                  onClick={() => setLeadPage((p) => (p + 1 >= Math.ceil(leads.length / PAGE_SIZE) ? p : p + 1))}
                  disabled={leadPage + 1 >= Math.ceil(leads.length / PAGE_SIZE)}
                  style={{
                    background: "#FF6B6B",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    padding: "4px 12px",
                    cursor: leadPage + 1 >= Math.ceil(leads.length / PAGE_SIZE) ? "not-allowed" : "pointer",
                    opacity: leadPage + 1 >= Math.ceil(leads.length / PAGE_SIZE) ? 0.5 : 1,
                }}
                >
                &gt;
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="muted">No hay solicitudes recientes</p>
        )}
      </div>

      {/* Modal de detalles */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
          }}
        >
          <div style={{ background: "white", padding: 20, borderRadius: 8, width: 640, maxWidth: "95%" }}>
            <h3 style={{ marginTop: 0 }}>Solicitud de {selected.name}</h3>
            
            <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
              <p><strong>Email:</strong> {selected.email}</p>
              <p><strong>Teléfono:</strong> {selected.phone || "—"}</p>
              <p><strong>Servicio:</strong> {selected.serviceId?.name || "—"}</p>
              <p><strong>Fecha evento:</strong> {selected.eventDate || "—"}</p>
              <p><strong>Casa/Local:</strong> {selected.house || "—"}</p>
              <p><strong>Mensaje:</strong> {selected.message || "—"}</p>
              <p>
                <strong>Estado:</strong> 
                <span 
                  style={{ 
                    marginLeft: 8,
                    padding: "4px 8px", 
                    borderRadius: 4, 
                    background: STATUS_COLORS[selected.status || "No atendido"],
                    color: "white",
                    fontSize: "12px"
                  }}
                >
                  {selected.status || "No atendido"}
                </span>
              </p>
              <p><strong>Fecha de solicitud:</strong> {new Date(selected.createdAt).toLocaleString()}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontWeight: "bold", fontSize: "14px" }}>Cambiar estado:</label>
                <select
                  value={selected.status || "No atendido"}
                  onChange={(e) => handleStatusChange(selected._id, e.target.value)}
                  disabled={updatingStatus === selected._id}
                  style={{
                    background: STATUS_COLORS[selected.status || "No atendido"],
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: updatingStatus === selected._id ? "not-allowed" : "pointer",
                    opacity: updatingStatus === selected._id ? 0.6 : 1,
                    minWidth: "140px"
                  }}
                >
                  {STATUS_OPTIONS.map(status => (
                    <option 
                      key={status} 
                      value={status} 
                      style={{ 
                        color: "black", 
                        background: "white",
                        padding: "8px"
                      }}
                    >
                      {status}
                    </option>
                  ))}
                </select>
                {updatingStatus === selected._id && (
                  <span style={{ fontSize: "12px", color: "#666" }}>Actualizando...</span>
                )}
              </div>
              
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  onClick={() => handleDeleteClick(selected)}
                  style={{ 
                    padding: "8px 12px", 
                    borderRadius: 6, 
                    background: "#ff6b6b",
                    color: "white",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Eliminar
                </button>
                <button 
                  onClick={close} 
                  style={{ 
                    padding: "8px 12px", 
                    borderRadius: 6,
                    background: "#868e96",
                    color: "white", 
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación de eliminación */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 70,
          }}
        >
          <div style={{ 
            background: "white", 
            padding: 24, 
            borderRadius: 8, 
            width: 400, 
            maxWidth: "95%",
            textAlign: "center"
          }}>
            <h3 style={{ marginTop: 0, color: "#ff6b6b" }}>⚠️ Confirmar eliminación</h3>
            <p style={{ margin: "16px 0" }}>
              ¿Estás seguro de que deseas eliminar la solicitud de <strong>{deleteConfirm.name}</strong>?
            </p>
            <p style={{ fontSize: "14px", color: "#666", margin: "8px 0 16px 0" }}>
              Esta acción no se puede deshacer.
            </p>
            
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={cancelDelete}
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  background: "#868e96",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  background: "#ff6b6b",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
);
}