// src/components/ModalPreview.jsx
import React from 'react';

export function ModalPreview({ 
  summary, 
  activities, 
  leads, 
  queriesByMonth, 
  stats, 
  type, 
  onConfirm, 
  onCancel 
}) {
  // Preparar datos para la vista previa
  const allActivities = [...activities].reverse(); // sin paginación
  const allLeads = [...leads].reverse();

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>
            Vista Previa del Reporte ({type === 'pdf' ? 'PDF' : 'Excel'})
          </h2>
          <button 
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            &times;
          </button>
        </div>

        {/* Resumen en tarjetas */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Resumen Ejecutivo</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#f0f8ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Servicios Totales</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{summary.totalServices ?? 0}</div>
            </div>
            <div style={{ padding: '16px', background: '#f0fff0', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Activos</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{summary.activeServices ?? 0}</div>
            </div>
            <div style={{ padding: '16px', background: '#fff8f0', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Actividades</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{summary.totalActivities ?? 0}</div>
            </div>
            <div style={{ padding: '16px', background: '#f8f0ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Consultas</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{leads.length}</div>
            </div>
          </div>
        </div>

        {/* Actividades Recientes */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Actividades Recientes</h3>
          {allActivities.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Acción</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Entidad</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Usuario</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {allActivities.map((act) => (
                  <tr key={act._id}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                      {act.type === "create" ? "Creado" : act.type === "update" ? "Editado" : act.type === "delete" ? "Eliminado" : act.type}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                      {act.entity === "service" ? "Servicio" : act.entity === "casa" ? "Casa" : act.entity}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{act.entityName}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{act.user}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                      {new Date(act.date).toLocaleString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#666' }}>No hay actividades recientes</p>
          )}
        </div>

        {/* Últimas Solicitudes */}
        <div>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Últimas Solicitudes de Información</h3>
          {allLeads.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Servicio</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Fecha Evento</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Fecha Solicitud</th>
                </tr>
              </thead>
              <tbody>
                {allLeads.map((lead) => (
                  <tr key={lead._id}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{lead.name}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{lead.email}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{lead.serviceId?.name || "—"}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{lead.eventDate}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                      {new Date(lead.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#666' }}>No hay solicitudes recientes</p>
          )}
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              background: type === 'pdf' ? '#d32f2f' : '#388e3c',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Descargar {type === 'pdf' ? 'PDF' : 'Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}