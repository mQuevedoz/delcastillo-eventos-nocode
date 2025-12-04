export async function listEvents(params = {}) {
  const url = new URL("/api/events", window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });
  const r = await fetch(url.pathname + url.search);
  if (!r.ok) throw new Error("Error al listar eventos");
  return r.json();
}

export async function createEvent(payload) {
  const r = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e?.error || "No se pudo crear");
  }
  return r.json();
}

export async function updateEvent(id, payload) {
  const r = await fetch(`/api/events/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e?.error || "No se pudo actualizar");
  }
  return r.json();
}

export async function removeEvent(id) {
  const r = await fetch(`/api/events/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("No se pudo eliminar");
  return r.json();
}

