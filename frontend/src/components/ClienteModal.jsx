import { useState, useEffect } from "react";
import { crearCliente, actualizarCliente } from "../api/clientes";
import "../pages/clientes.css";

export default function ClienteModal({ open, onClose, cliente, onSaved }) {
  const [data, setData] = useState({
    nombre: "",
    direccion: "",
    email: "",
    telefono: "",
  });

  useEffect(() => {
    if (cliente) setData(cliente);
    else setData({ nombre: "", direccion: "", email: "", telefono: "" });
  }, [cliente]);

  if (!open) return null;

  const handleGuardar = async () => {
    try {
      if (cliente?._id) {
        await actualizarCliente(cliente._id, data);
        alert("Cliente actualizado correctamente");
      } else {
        await crearCliente(data);
        alert("Cliente agregado correctamente");
      }
      onSaved?.();
    } catch (error) {
      alert(error.error || "Error guardando cliente");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-contenido form-elegante">
        <h3>{cliente ? "Editar cliente" : "Nuevo cliente"}</h3>

        <div className="form-grid">
          <div className="campo">
            <label>Nombre</label>
            <input
              value={data.nombre}
              onChange={(e) => setData({ ...data, nombre: e.target.value })}
              placeholder="Nombre completo"
            />
          </div>

          <div className="campo">
            <label>Dirección</label>
            <input
              value={data.direccion}
              onChange={(e) => setData({ ...data, direccion: e.target.value })}
              placeholder="Calle o zona"
            />
          </div>

          <div className="campo">
            <label>Email</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              placeholder="ejemplo@email.com"
            />
          </div>

          <div className="campo">
            <label>Teléfono</label>
            <input
              value={data.telefono}
              onChange={(e) => setData({ ...data, telefono: e.target.value })}
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="acciones">
          <button className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-guardar" onClick={handleGuardar}>
            {cliente ? "Guardar cambios" : "Crear cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}
