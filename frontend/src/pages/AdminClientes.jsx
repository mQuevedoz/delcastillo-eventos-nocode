import { useEffect, useState } from "react";
import {
  listarClientes,
  eliminarCliente,
} from "../api/clientes";
import "./clientes.css";
import ClienteModal from "../components/ClienteModal";
//import ClienteModal from "../components/ReporteModal";

export default function ClientesList() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [dia, setDia] = useState("");
  const [mes, setMes] = useState("");
  const [año, setAño] = useState("");

async function cargar() {
  try {
    const params = {};
    if (busqueda) params.busqueda = busqueda;
    if (mes) params.mes = mes;
    if (año) params.año = año;
    if (dia) params.dia = dia;

    const data = await listarClientes(params);
    setClientes(data);
  } catch (error) {
    alert(error.error || "Error cargando clientes");
  }
}



useEffect(() => {
  cargar();
}, [busqueda, mes, año]);

  // async function cargar() {
  //   try {
  //     const data = await listarClientes(busqueda);
  //     setClientes(data);
  //   } catch (error) {
  //     alert(error.error || "Error cargando clientes");
  //   }
  // }


  
  // useEffect(() => {
  //   cargar();
  // }, [busqueda]);

  const handleNuevo = () => {
    setClienteSeleccionado(null);
    setModalAbierto(true);
  };

  const handleEditar = (cliente) => {
    setClienteSeleccionado(cliente);
    setModalAbierto(true);
  };

  async function eliminar(id) {
    const confirm1 = confirm("¿Seguro que deseas eliminar este cliente?");
    if (!confirm1) return;

    const confirm2 = prompt('Escribe "ELIMINAR" para confirmar:');
    if (confirm2 !== "ELIMINAR") {
      alert("Operación cancelada.");
      return;
    }

    try {
      await eliminarCliente(id);
      alert("Cliente eliminado correctamente");
      cargar();
    } catch (error) {
      alert(error.error || "Error eliminando cliente");
    }
  }
  async function generarReporte() {
    if (!mes || !año) {
      alert("Selecciona mes y año para generar el reporte");
      return;
    }

    try {
      const query = new URLSearchParams();
      query.append("mes", mes);
      query.append("año", año);
      if (dia) query.append("dia", dia);

      const res = await fetch(`/api/clientes/reporte?${query.toString()}`);

      if (!res.ok) {
          const errorData = await res.json().catch(() => ({})); 
          throw new Error(errorData.error || "Error generando reporte");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Crear enlace temporal
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_clientes_${mes}-${año}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // Limpieza
      a.parentNode.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      alert(error.message);
      console.error("Error descarga:", error);
    }
  }

  // async function generarReporte() {
  //   if (!dia && !mes) {
  //     alert("Selecciona al menos el día o el mes.");
  //     return;
  //   }

  //   try {
  //     const query = new URLSearchParams();
  //     if (dia) query.append("dia", dia);
  //     if (mes) query.append("mes", mes);

  //     const res = await fetch(
  //       `${import.meta.env.VITE_API_URL}/api/clientes/reporte?${query.toString()}`
  //     );

  //     if (!res.ok) throw new Error("Error generando reporte");

  //     // Descargar Excel
  //     const blob = await res.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = `reporte_clientes_${dia || "todos"}-${mes || "todos"}.xlsx`;
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     alert("Error generando reporte");
  //     console.error(error);
  //   }
  // }

  return (
    <div className="card-clientes">
      <div className="header-clientes">
        <h2>Gestión de Clientes</h2>

        <div className="buscador">
          <div className="buscador-icon">🔍</div>
          <input
            className="buscador-input"
            placeholder="Buscar clientes..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button className="btn-nuevo" onClick={handleNuevo}>
            + Nuevo Cliente
          </button>
        </div>
      </div>

      {/* === SECCIÓN DE REPORTE === */}
      <div className="reporte-section">
        <h3>Generar reporte por fecha</h3>
        <div className="reporte-filtros">
          <input
            type="number"
            min="1"
            max="31"
            placeholder="Día"
            value={dia || ""}
            onChange={(e) => setDia(e.target.value)}
          />
          <input
            type="number"
            min="1"
            max="12"
            placeholder="Mes"
            value={mes || ""}
            onChange={(e) => setMes(e.target.value)}
          />

          <input
            type="number"
            min="2000"
            max="2100"
            placeholder="Año"
            value={año || ""}
            onChange={(e) => setAño(e.target.value)}
          />

          <button onClick={generarReporte} className="btn-reporte">
            📊 Generar Reporte
          </button>
        </div>
      </div>

      {/* MODAL hijo */}
      {modalAbierto && (
        <ClienteModal
          open={modalAbierto}
          onClose={() => setModalAbierto(false)}
          cliente={clienteSeleccionado}
          onSaved={() => {
            setModalAbierto(false);
            cargar();
          }}
        />
      )}

      {/* LISTA DE CLIENTES */}
      <table className="tabla-clientes">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Contacto</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c._id}>
              <td>
                {c.nombre}
                <div className="direccion">{c.direccion}</div>
              </td>
              <td>
                {c.telefono}
                <div className="direccion">{c.email}</div>
              </td>
              <td>{new Date(c.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  className="accion editar"
                  onClick={() => handleEditar(c)}
                >
                  <span className="material-icons">edit</span>
                </button>
                <button
                  className="accion eliminar"
                  onClick={() => eliminar(c._id)}
                >
                  <span className="material-icons">delete_outline</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
