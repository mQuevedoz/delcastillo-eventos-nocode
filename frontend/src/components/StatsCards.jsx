// frontend/src/components/dashboard/StatsCards.jsx
import { Briefcase, CheckCircle, Users, DollarSign } from "lucide-react";

export default function StatsCards({ stats }) {
  // stats será un objeto con los valores que mandes desde el backend
  // ejemplo: { totalServices: 12, activeServices: 9, totalClients: 25, revenue: 1500 }

  const cards = [
    {
      title: "Servicios totales",
      value: stats.totalServices || 0,
      icon: <Briefcase className="w-6 h-6 text-orange-600" />,
      color: "bg-orange-100",
    },
    {
      title: "Activos",
      value: stats.activeServices || 0,
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      color: "bg-green-100",
    },
    {
      title: "Clientes",
      value: stats.totalClients || 0,
      icon: <Users className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-100",
    },
    {
      title: "Ingresos",
      value: `S/. ${stats.revenue || 0}`,
      icon: <DollarSign className="w-6 h-6 text-purple-600" />,
      color: "bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4"
        >
          <div
            className={`p-3 rounded-full ${card.color} flex items-center justify-center`}
          >
            {card.icon}
          </div>
          <div>
            <p className="text-sm text-gray-500">{card.title}</p>
            <p className="text-xl font-bold text-gray-800">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
