// src/api/services.js

const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

// Helpers de imágenes (compartidos cliente/admin)
export const imageUrl = (id) => `${BASE}/api/images/${id}`;
export const thumbUrl = (id) => `${BASE}/api/images/thumb/${id}`;

export async function listServices(q = "") {
  const url = q ? `${BASE}/api/services?q=${encodeURIComponent(q)}` : `${BASE}/api/services`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error listando servicios: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getService(id) {
  const res = await fetch(`${BASE}/api/services/${id}`);
  if (!res.ok) throw new Error("Servicio no encontrado");
  return res.json();
}

// Lead (solicitud de cotización)
export async function createLead(payload) {
  const res = await fetch(`${BASE}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || "Error creando solicitud");
  }
  return res.json();
}

// Actualizar estado de solicitud
export async function updateLeadStatus(id, status) {
  const res = await fetch(`${BASE}/api/leads/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || "Error actualizando estado");
  }
  return res.json();
}

// Eliminar solicitud
export async function deleteLead(id) {
  const res = await fetch(`${BASE}/api/leads/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || "Error eliminando solicitud");
  }
  return res.json();
}
