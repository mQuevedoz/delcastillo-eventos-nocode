const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

export const fileUrl  = (id) => `${BASE}/api/images/${id}`;
export const thumbUrl = (id) => `${BASE}/api/images/thumb/${id}`;

const isHttp = (v) => typeof v === "string" && /^https?:\/\//i.test(v);

export function resolveThumbSrc(img) {
  if (!img) return null;
  if (typeof img === "string") return isHttp(img) ? img : thumbUrl(img);
  if (img.url && isHttp(img.url)) return img.url;
  const id = img.imageId || img.id || img._id;
  return id ? (isHttp(id) ? id : thumbUrl(id)) : null;
}

export async function adminListServices() {
  const r = await fetch(`${BASE}/api/services`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function adminGetService(id) {
  const r = await fetch(`${BASE}/api/services/${id}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function adminCreateService(payload) {
  const r = await fetch(`${BASE}/api/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function adminUpdateService(id, payload) {
  const r = await fetch(`${BASE}/api/services/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function adminDeleteService(id) {
  const r = await fetch(`${BASE}/api/services/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ✅ Subida correcta (sin /upload) y normalización
export async function uploadImages(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return [];

  const fd = new FormData();
  files.forEach(f => fd.append("files", f));

  const r = await fetch(`${BASE}/api/images`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(await r.text());
  const data = await r.json();
  const arr = Array.isArray(data) ? data : (data.uploaded || []);
  // normaliza a { id, imageId, _id, filename }
  return arr.map(x => ({
    id: x.id || x._id,
    _id: x._id || x.id,
    imageId: x.id || x._id,
    filename: x.filename || x.originalname || "",
  }));
}
