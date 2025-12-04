// API para Servicios Extras (mismo patrón que adminServices.js: fetch + BASE)
const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

// --------- CRUD ---------
export async function adminListExtras(q = "") {
  const url = `${BASE}/api/extras${q ? `?q=${encodeURIComponent(q)}` : ""}`;
  const r = await fetch(url, { method: "GET" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function adminGetExtra(id) {
  const r = await fetch(`${BASE}/api/extras/${id}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function adminCreateExtra(payload) {
  const r = await fetch(`${BASE}/api/extras`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function adminUpdateExtra(id, payload) {
  const r = await fetch(`${BASE}/api/extras/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function adminDeleteExtra(id) {
  const r = await fetch(`${BASE}/api/extras/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
  // algunos backends devuelven vacío con 204; normalizamos a {}
  try { return await r.json(); } catch { return {}; }
}

// --------- Gestión de imágenes (post-upload) ---------
// body: { url, isCover?: boolean }
export async function adminAddExtraImage(id, { url, isCover = false }) {
  const r = await fetch(`${BASE}/api/extras/${id}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, isCover }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function adminDeleteExtraImage(id, imageId) {
  const r = await fetch(`${BASE}/api/extras/${id}/images/${imageId}`, {
    method: "DELETE",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function adminSetExtraCover(id, imageId) {
  const r = await fetch(`${BASE}/api/extras/${id}/cover/${imageId}`, {
    method: "PATCH",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default {
  adminListExtras,
  adminGetExtra,
  adminCreateExtra,
  adminUpdateExtra,
  adminDeleteExtra,
  adminAddExtraImage,
  adminDeleteExtraImage,
  adminSetExtraCover,
};
