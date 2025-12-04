// frontend/src/components/dashboard/RecentActivities.jsx
import { useEffect, useState } from "react";
import { listRecentActivities } from "@/api/activities";

export default function RecentActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await listRecentActivities();
        setActivities(data);
      } catch (err) {
        console.error("Error cargando actividades:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <p className="text-gray-500 animate-pulse">Cargando actividades...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          Actividades recientes
        </h3>
        <a
          href="#"
          className="text-sm font-medium text-orange-600 hover:underline"
        >
          Ver todas
        </a>
      </div>

      {/* Tabla de actividades recientes */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <th className="px-4 py-2 text-left">Acción</th>
              <th className="px-4 py-2 text-left">Entidad</th>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Usuario</th>
              <th className="px-4 py-2 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {activities.length > 0 ? (
              activities.map((act) => (
                <tr
                  key={act._id}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2 font-medium text-gray-800">
                    {act.type === "create"
                      ? "Creado"
                      : act.type === "update"
                      ? "Editado"
                      : act.type === "delete"
                      ? "Eliminado"
                      : act.type}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {act.entity === "service"
                      ? "Servicio"
                      : act.entity === "casa"
                      ? "Casa"
                      : act.entity}
                  </td>
                  <td className="px-4 py-2 text-gray-700">{act.entityName}</td>
                  <td className="px-4 py-2 text-gray-700">{act.user}</td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(act.date).toLocaleString("es-PE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="p-4 text-center text-gray-400 italic"
                >
                  No hay actividades recientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
