import { useState } from "react";
import "../pages/clientes.css";

export default function ReporteModal({ open, onClose }) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  if (!open) return null;

  const handleGenerar = async () => {
    if (!fechaInicio || !fechaFin) {
      alert("Por favor selecciona ambas fechas");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/clientes/reporte?inicio=${fechaInicio}&fin=${fechaFin}`
      );

      if (!res.ok) throw new Error("Error generando el reporte");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_clientes_${fechaInicio}_a_${fechaFin}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      alert("Reporte descargado correctamente ✅");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Hubo un error al generar el reporte");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-contenido form-elegante">
        <h3>Generar Reporte de Clientes</h3>

        <div className="form-grid">
          <div className="campo">
            <label>Desde:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

          <div className="campo">
            <label>Hasta:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
        </div>

        <div className="acciones">
          <button className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-guardar" onClick={handleGenerar}>
            Generar Reporte
          </button>
        </div>
      </div>
    </div>
  );
}
