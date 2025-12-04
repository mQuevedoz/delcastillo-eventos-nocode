// frontend/src/api/activities.js

// Obtener actividades recientes
export async function listRecentActivities() {
  // Llama a tu backend en /api/activities
  const res = await fetch("/api/activities");

  // Manejo manual de errores, porque fetch no lanza excepción por 404/500
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error obteniendo actividades: ${res.status} ${text}`);
  }

  // Si todo va bien, convierte a JSON
  return res.json();
}
