// src/api/casas.js

// Usamos VITE_API_URL si está definida, sino rutas relativas (proxy de Vite)
const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

/** LISTAR CASAS */
export async function listarCasas(q = "") {
  const url = q ? `${BASE}/api/casas?q=${encodeURIComponent(q)}` : `${BASE}/api/casas`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error listando casas: ${res.status} ${text}`);
  }
  return res.json();
}

/** OBTENER UNA CASA POR SLUG */
export async function obtenerCasa(slug) {
  const res = await fetch(`${BASE}/api/casas/slug/${slug}`);
  if (!res.ok) throw new Error("Casa no encontrada");
  return res.json();
}

/** CREAR UNA CASA (devuelve el documento creado) */
export async function crearCasa(data) {
  const res = await fetch(`${BASE}/api/casas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error creando casa: ${res.status} ${text}`);
  }
  return res.json();
}

/** ACTUALIZAR UNA CASA (por id) */
export async function actualizarCasa(id, data) {
  const res = await fetch(`${BASE}/api/casas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error actualizando casa: ${res.status} ${text}`);
  }
  return res.json();
}

/** ELIMINAR UNA CASA (borrado real) */
export async function eliminarCasa(id) {
  const res = await fetch(`${BASE}/api/casas/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error eliminando casa: ${res.status} ${text}`);
  }
  return res.json();
}

/** Cambiar estado activa/inactiva (si lo sigues usando) */
export async function cambiarEstadoCasa(id, activa) {
  const res = await fetch(`${BASE}/api/casas/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activa }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error cambiando estado: ${res.status} ${text}`);
  }
  return res.json();
}

/* =======================
   Gestión de IMÁGENES
   ======================= */

/** Subir imágenes para una casa (FormData con campo 'files') 
 *  -> { uploaded: [{ id, filename, ... }, ...] }
 */
export async function addCasaImages(casaId, formData) {
  const res = await fetch(`${BASE}/api/casas/${casaId}/images`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error subiendo imágenes: ${res.status} ${text}`);
  }
  return res.json();
}

/** Eliminar una imagen concreta de la casa */
export async function removeCasaImage(casaId, imageId) {
  const res = await fetch(`${BASE}/api/casas/${casaId}/images/${imageId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error eliminando imagen: ${res.status} ${text}`);
  }
  return res.json();
}

/** Establecer una imagen como portada */
export async function setCoverCasa(casaId, imageId) {
  const res = await fetch(`${BASE}/api/casas/${casaId}/cover`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageId }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error definiendo portada: ${res.status} ${text}`);
  }
  return res.json();
}

// Trae SOLO casas activas desde el backend
export async function listActiveCasas() {
  const r = await fetch("/api/casas?active=true");
  if (!r.ok) throw new Error("Error al listar casas");
  return r.json(); // [{ _id, nombre, direccion, activa:true }]
}
