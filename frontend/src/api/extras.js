const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

/** Lista extras públicos con búsqueda opcional */
export async function listExtras(q = "") {
  const url = `${BASE}/api/extras${q ? `?q=${encodeURIComponent(q)}` : ""}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
