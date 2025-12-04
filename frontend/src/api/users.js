// src/api/users.js

const BASE = (import.meta.env.VITE_API_URL?.replace(/\/$/, "")) || "";

/* Header con token si existe */
function authHeaders(extra = {}) {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

/* Helper de error consistente */
async function ensureOk(res, fallbackMsg) {
  if (res.ok) return;
  let msg = fallbackMsg;
  try {
    const data = await res.json();
    if (data?.error) msg = data.error;
  } catch {
    const text = await res.text().catch(() => "");
    if (text) msg = `${fallbackMsg}: ${text}`;
  }
  throw new Error(msg);
}

/** Listar usuarios (opcional: q) */
export async function listUsers(q = "") {
  const url = q ? `${BASE}/api/users?q=${encodeURIComponent(q)}` : `${BASE}/api/users`;
  const res = await fetch(url, { headers: authHeaders() });
  await ensureOk(res, "Error listando usuarios");
  return res.json();
}

/** Obtener usuario por id */
export async function getUser(id) {
  const res = await fetch(`${BASE}/api/users/${id}`, { headers: authHeaders() });
  await ensureOk(res, "Usuario no encontrado");
  return res.json();
}

/** Crear usuario (password >= 6; el backend lo encripta) */
export async function createUser(payload) {
  const res = await fetch(`${BASE}/api/users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  await ensureOk(res, "Error creando usuario");
  return res.json();
}

/** Actualizar datos (sin password) */
export async function updateUser(id, payload) {
  const res = await fetch(`${BASE}/api/users/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  await ensureOk(res, "Error actualizando usuario");
  return res.json();
}

/** Cambiar contraseña */
export async function updatePassword(id, password) {
  const res = await fetch(`${BASE}/api/users/${id}/password`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ password }),
  });
  await ensureOk(res, "Error actualizando contraseña");
  return res.json();
}

/** Eliminar usuario */
export async function deleteUser(id) {
  const res = await fetch(`${BASE}/api/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await ensureOk(res, "Error eliminando usuario");
  return res.json();
}
