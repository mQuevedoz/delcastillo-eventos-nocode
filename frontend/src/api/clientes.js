import axios from "axios";

const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

/** LISTAR CLIENTES */
export async function listarClientes(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`${BASE}/api/clientes?${query}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { error: "Error listando clientes" };
  }
  return res.json();
}

/** CREAR CLIENTE */
export async function crearCliente(data) {
  const res = await fetch(`${BASE}/api/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error creando cliente: ${res.status} ${text}`);
  }
  return res.json();
}

/** ACTUALIZAR CLIENTE */
export async function actualizarCliente(id, data) {
  const res = await fetch(`${BASE}/api/clientes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error actualizando cliente: ${res.status} ${text}`);
  }
  return res.json();
}

/** ELIMINAR CLIENTE */
export async function eliminarCliente(id) {
  const res = await fetch(`${BASE}/api/clientes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error eliminando cliente: ${res.status} ${text}`);
  }
  return res.json();
}
