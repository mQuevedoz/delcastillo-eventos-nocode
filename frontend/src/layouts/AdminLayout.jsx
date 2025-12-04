// src/layouts/AdminLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./admin.css";

const AUTH_TOKEN_KEY = "authToken"; // Ahora usamos el token, no "admAuth"

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem("userData"); // Tambien limpiamos los datos del usuario
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className="admin-aside">
        <div className="admin-brand">
          <img src="/LOGO DEL CASTILLO.png" alt="Logo" />
          <span>Panel Admin</span>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className="admin-link">
            📊 Dashboard
          </NavLink>
          <NavLink to="/admin/usuarios" className="admin-link">
            👤 Administrar usuarios
          </NavLink>
          <NavLink to="/admin/clientes" className="admin-link">
            🧾 Administrar clientes
          </NavLink>
          <NavLink to="/admin/servicios" className="admin-link">
            🧰 Gestionar servicios
          </NavLink>
          <NavLink to="/admin/casas" className="admin-link">
            🏠 Gestionar casas
          </NavLink>
          <NavLink to="/admin/proveedores" className="admin-link">
            🏢 Gestionar Proveedores
          </NavLink>
          <NavLink to="/admin/eventos" className="admin-link">
            💼 Eventos Contratados
          </NavLink>
          <NavLink to="/admin/extras" className="admin-link">
            🧾 Servicios Extras
          </NavLink>
          <NavLink to="/admin/solicitudes" className="admin-link">
            🏢 Gestionar Solicitudes
          </NavLink>
        </nav>

        <button className="admin-logout" onClick={logout}>
          Cerrar sesión
        </button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}