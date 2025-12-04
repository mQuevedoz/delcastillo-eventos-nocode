// src/components/dashboard/ChartsSection.jsx
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

import { listServices } from "@/api/services";
import { listRecentActivities } from "@/api/activities"; // lo usamos como "ventas" simuladas

export default function ChartsSection() {
  const [servicesData, setServicesData] = useState([]);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    // 🔸 Cargar servicios
    async function fetchServices() {
      try {
        const services = await listServices();

        // Agrupar por categoría
        const porCategoria = services.reduce((acc, s) => {
          acc[s.category] = (acc[s.category] || 0) + 1;
          return acc;
        }, {});

        const formatted = Object.entries(porCategoria).map(([categoria, total]) => ({
          categoria,
          total,
        }));

        setServicesData(formatted);
      } catch (err) {
        console.error("Error cargando servicios:", err.message);
      }
    }

    // 🔸 Cargar actividades (simulamos ventas en el tiempo)
    async function fetchActivities() {
      try {
        const activities = await listRecentActivities();

        // Agrupar por mes
        const porMes = activities.reduce((acc, act) => {
          const fecha = new Date(act.createdAt);
          const mes = fecha.toLocaleString("es-ES", { month: "short" });
          acc[mes] = (acc[mes] || 0) + 1;
          return acc;
        }, {});

        const formatted = Object.entries(porMes).map(([mes, ventas]) => ({
          mes,
          ventas,
        }));

        setSalesData(formatted);
      } catch (err) {
        console.error("Error cargando actividades:", err.message);
      }
    }

    fetchServices();
    fetchActivities();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Gráfico de Barras */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Servicios por categoría</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={servicesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoria" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#f97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Líneas */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Actividades / Ventas en el tiempo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ventas" stroke="#f97316" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
