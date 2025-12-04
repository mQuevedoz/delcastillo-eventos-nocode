// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";

// Público
import ServicesPage from "./pages/ServicesPage.jsx";
import ServiceDetail from "./pages/ServiceDetail.jsx";
import Nosotros from "./pages/Nosotros.jsx";
import Contacto from "./pages/Contacto.jsx";
import CasasPage from "./pages/CasasPage.jsx";
import ExtrasPage from "./pages/ExtrasPage.jsx";

// Admin
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminUsuarios from "./pages/AdminUsuarios.jsx";
import AdminClientes from "./pages/AdminClientes.jsx";
import AdminServicios from "./pages/AdminServicios.jsx";
import AdminExtras from "./pages/AdminExtras"; 
import AdminServicioEditar from "./pages/AdminServicioEditar.jsx";
import AdminCasas from "./pages/AdminCasas.jsx";
import ProvidersPage from "./pages/ProvidersPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import AdminSolicitudes from "./pages/AdminSolicitudes.jsx";

export default function App() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith("/admin"); // oculta Header en /admin*

  return (
    <>
      {!isAdminRoute && <Header />}

      <Routes>
        {/* Público */}
        <Route path="/" element={<ServicesPage />} />
        <Route path="/service/:id" element={<ServiceDetail />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/casas" element={<CasasPage />} />
        <Route path="/extras" element={<ExtrasPage />} />

        {/* Admin: login SIN layout */}
        <Route path="/admin/login" element={<AdminLogin />} />
        {/* Atajo /admin -> /admin/login */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

        {/* Admin interno: layout PROTEGIDO */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="clientes" element={<AdminClientes />} />
          <Route path="servicios" element={<AdminServicios />} />
          
          {/* RUTA HIJA RELATIVA, NO ABSOLUTA */}
          <Route path="servicios/nuevo" element={<AdminServicioEditar />} />
          <Route path="servicios/:id" element={<AdminServicioEditar />} />
          <Route path="casas" element={<AdminCasas />} />
          <Route path="solicitudes" element={<AdminSolicitudes />} />
          <Route path="proveedores" element={<ProvidersPage />} />
          <Route path="eventos" element={<EventsPage />} />        
          <Route path="extras" element={<AdminExtras />}/>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
