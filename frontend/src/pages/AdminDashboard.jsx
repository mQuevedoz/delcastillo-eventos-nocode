import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  FaClipboardList,
  FaCheckCircle,
  FaInfoCircle,
  FaChartPie,
} from "react-icons/fa";
import { ModalPreview } from '../components/ModalPreview';
import { listEvents } from "../api/events";
export default function AdminDashboard() {
  const [summary, setSummary] = useState({});
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [leads, setLeads] = useState([]);
  const [queriesByMonth, setQueriesByMonth] = useState([]);
  const [leadsByService, setLeadsByService] = useState([]);
  // Estados para paginación
  const [activityPage, setActivityPage] = useState(0);
  const [leadPage, setLeadPage] = useState(0);
  const PAGE_SIZE = 5;

  // 👇 Estados para el modal de reportes
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [exportType, setExportType] = useState(null);

  useEffect(() => {
    fetch("/api/admin/summary")
      .then((res) => res.json())
      .then(setSummary)
      .catch((err) => console.error(err));



    fetch("/api/admin/services-stats")
      .then((res) => res.json())
      .then(setStats)
      .catch((err) => console.error(err));

    fetch("/api/admin/recent-activities")
      .then((res) => res.json())
      .then(setActivities)
      .catch((err) => console.error(err));

    fetch("/api/leads")
      .then((res) => res.json())
      .then(setLeads)
      .catch((err) => console.error(err));

    fetch("/api/admin/queries-by-month")
      .then((res) => res.json())
      .then((data) => {
        const months = [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        const formatted = data.map((item) => {
          let mes = item.month || item._id; 
          let year = "";
          if (mes.includes("-")) {
            const parts = mes.split("-");
            year = parts[0];
            mes = parts[1];
          }
          return {
            ...item,
            month: months[parseInt(mes, 10) - 1] || "Sin mes",
            year,
          };
        });

        setQueriesByMonth(formatted);
      })
      .catch((err) => console.error(err));
      async function fetchEarnings() {
      try {
        const events = await listEvents();
        const total = events.reduce((acc, ev) => acc + (ev.price || 0), 0);
        setEarnings(total);
      } catch (error) {
        console.error("Error al obtener ganancias:", error);
      }
    }
    fetchEarnings();

  }, []);
  
  useEffect(() => {
    const socket = io("http://localhost:5000", { withCredentials: true });

    socket.on("new-lead", (lead) => {
      setLeads((prev) => [...prev, lead]);
    });

    socket.on("queries-by-month-updated", (data) => {
      const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];

      const formatted = data.map((item) => {
        const [year, month] = item.month.split("-");
        return {
          ...item,
          month: months[parseInt(month, 10) - 1] || "Sin mes",
          year,
        };
      });

      setQueriesByMonth(formatted);
    });

    socket.on("leads-by-service-updated", (data) => {
      setLeadsByService(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 👇 Funciones para el modal
  const handleOpenPreview = (type) => {
    setExportType(type);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  const handleConfirmExport = async () => {
  try {
    const response = await fetch(`/api/reports/generate?type=${exportType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Error al generar el reporte');
    }

    // Descargar el archivo
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportType === 'pdf' 
      ? `reporte-dashboard-${new Date().toISOString().slice(0,10)}.pdf`
      : `reporte-dashboard-${new Date().toISOString().slice(0,10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error('Error:', err);
    alert('❌ ' + err.message);
  } finally {
    setIsPreviewOpen(false);
  }
};

  // Paleta pastel naranja y similares
  const colors = [
    "#FFD8A8", // pastel naranja claro
    "#FFC078", // naranja pastel
    "#FFA94D", // naranja medio
    "#FFD6A5", // durazno pastel
    "#FFE066", // amarillo pastel
    "#FFB4A2", // coral pastel
    "#FFB997", // naranja rosado pastel
    "#FFE5B4", // beige pastel
    "#FFD1BA", // salmón pastel
    "#FFF3BF"  // amarillo muy claro
  ];

  return (
    <div className="container page-content">
      <h1 className="page-title">Dashboard del Administrador</h1>

      {/* 👇 Botones de reporte */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => handleOpenPreview('pdf')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📄 Generar PDF
        </button>
        <button
          onClick={() => handleOpenPreview('excel')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#388e3c',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📊 Generar Excel
        </button>
      </div>

      {/* Tarjetas KPI */}
      <div className="kpi-grid">
        <Card
          icon={<FaClipboardList />}
          title="Servicios Totales"
          value={summary.totalServices}
          color="orange"
        />
        <Card
          icon={<FaCheckCircle />}
          title="Activos"
          value={summary.activeServices}
          color="green"
        />
        <Card
          icon={<FaChartPie />}
          title="Actividades"
          value={summary.totalActivities}
          color="blue"
        />
        <Card
          icon={<FaInfoCircle />}
          title="Consultas"
          value={leads.length}
          color="red"
        />
        <Card
          icon={<FaClipboardList />}
          title="Ganancias"
          value={`S/ ${earnings.toFixed(2)}`}
          color="blue"
        />
      </div>

      {/* Gráficos */}
      <div className="charts-grid mt-6">
        {/* Circular */}
        <div className="box p-6 h-full w-full">
          <h2 className="section-title mb-4">Servicios por Categoría</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats}
                dataKey="count"
                nameKey="category"
                outerRadius={110}
                label
              >
                {stats.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Línea */}
        <div className="box p-6 h-full w-full">
          <h2 className="section-title">
            Tendencia de Consultas por Mes - {queriesByMonth[0]?.year}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={queriesByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend
                formatter={(value) => (
                  <span style={{ color: '#FFA94D', fontWeight: 600 }}>{value === 'count' ? 'Nro Consultas' : value}</span>
                )}
              />
              <Line type="monotone" dataKey="count" stroke="#FFA94D" strokeWidth={3} dot={{ r: 4, fill: '#FFA94D' }} activeDot={{ r: 6, fill: '#FFA94D', stroke: '#FFB86B', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actividades recientes */}
      <div className="box mt-6" style={{ marginTop: 40, marginBottom: 32 }}>
        <h2 className="section-title mb-4">Actividades Recientes</h2>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Acción</th>
                <th>Entidad</th>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {activities.length > 0 ? (
                activities
                  .slice()
                  .reverse()
                  .slice(activityPage * PAGE_SIZE, activityPage * PAGE_SIZE + PAGE_SIZE)
                  .map((act) => (
                    <tr key={act._id}>
                      <td>
                        {act.type === "create"
                          ? "Creado"
                          : act.type === "update"
                          ? "Editado"
                          : act.type === "delete"
                          ? "Eliminado"
                          : act.type}
                      </td>
                      <td>
                        {act.entity === "service"
                          ? "Servicio"
                          : act.entity === "casa"
                          ? "Casa"
                          : act.entity}
                      </td>
                      <td>{act.entityName}</td>
                      <td>{act.user}</td>
                      <td>
                        {new Date(act.date).toLocaleString("es-PE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-400 italic">
                    No hay actividades recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <span style={{ color: '#FFB86B', fontWeight: 'bold' }}>Total: {activities.length}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setActivityPage((p) => Math.max(0, p - 1))}
                disabled={activityPage === 0}
                style={{
                  background: '#FFB86B',
                  color: '#333',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 12px',
                  cursor: activityPage === 0 ? 'not-allowed' : 'pointer',
                  opacity: activityPage === 0 ? 0.5 : 1,
                  fontSize: 18,
                  fontWeight: 600,
                  transition: 'background 0.2s',
                  marginRight: 4
                }}
              ></button>
              <span style={{ margin: '0 8px', color: '#333', fontWeight: 500 }}>{activityPage + 1} / {Math.max(1, Math.ceil(activities.length / PAGE_SIZE))}</span>
              <button
                onClick={() => setActivityPage((p) => p + 1 >= Math.ceil(activities.length / PAGE_SIZE) ? p : p + 1)}
                disabled={activityPage + 1 >= Math.ceil(activities.length / PAGE_SIZE)}
                style={{
                  background: '#FFB86B',
                  color: '#333',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 12px',
                  cursor: activityPage + 1 >= Math.ceil(activities.length / PAGE_SIZE) ? 'not-allowed' : 'pointer',
                  opacity: activityPage + 1 >= Math.ceil(activities.length / PAGE_SIZE) ? 0.5 : 1,
                  fontSize: 18,
                  fontWeight: 600,
                  transition: 'background 0.2s',
                  marginLeft: 4
                }}
              ></button>
            </div>
          </div>
        </div>
      </div>

      {/* Últimas Solicitudes de Información */}
      <div className="box mt-6" style={{ marginBottom: 32 }}>
        <h2 className="section-title">Últimas Solicitudes de Información</h2>
        {leads.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Servicio</th>
                  <th>Fecha Evento</th>
                  <th>Fecha Solicitud</th>
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
                      <td>{lead.eventDate}</td>
                      <td>{new Date(lead.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <span style={{ color: '#FF6B6B', fontWeight: 'bold' }}>Total: {leads.length}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setLeadPage((p) => Math.max(0, p - 1))}
                  disabled={leadPage === 0}
                  style={{
                    background: '#FF6B6B',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 12px',
                    cursor: leadPage === 0 ? 'not-allowed' : 'pointer',
                    opacity: leadPage === 0 ? 0.5 : 1,
                    fontSize: 18,
                    fontWeight: 600,
                    transition: 'background 0.2s',
                    marginRight: 4
                  }}
                ></button>
                <span style={{ margin: '0 8px', color: '#333', fontWeight: 500 }}>{leadPage + 1} / {Math.max(1, Math.ceil(leads.length / PAGE_SIZE))}</span>
                <button
                  onClick={() => setLeadPage((p) => p + 1 >= Math.ceil(leads.length / PAGE_SIZE) ? p : p + 1)}
                  disabled={leadPage + 1 >= Math.ceil(leads.length / PAGE_SIZE)}
                  style={{
                    background: '#FF6B6B',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 12px',
                    cursor: leadPage + 1 >= Math.ceil(leads.length / PAGE_SIZE) ? 'not-allowed' : 'pointer',
                    opacity: leadPage + 1 >= Math.ceil(leads.length / PAGE_SIZE) ? 0.5 : 1,
                    fontSize: 18,
                    fontWeight: 600,
                    transition: 'background 0.2s',
                    marginLeft: 4
                  }}
                ></button>
              </div>
            </div>
          </div>
        ) : (
          <p className="muted">No hay solicitudes recientes</p>
        )}
      </div>

      {/* 👇 Modal de vista previa - debe estar dentro del contenedor principal */}
      {isPreviewOpen && (
        <ModalPreview
          summary={summary}
          activities={activities}
          leads={leads}
          queriesByMonth={queriesByMonth}
          stats={stats}
          type={exportType}
          onConfirm={handleConfirmExport}
          onCancel={handleClosePreview}
        />
      )}
    </div>
  );
}

// Tarjetas KPI
function Card({ icon, title, value, color }) {
  return (
    <div className={`kpi-card ${color}`}>
      <div className="kpi-header">
        <div className="icon">{icon}</div>
        <span>{title}</span>
      </div>
      <div className="kpi-body">
        <div className="kpi-value">{value ?? 0}</div>
      </div>
    </div>
  );
}