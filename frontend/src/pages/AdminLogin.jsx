// src/pages/AdminLogin.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Importamos axios para hacer peticiones HTTP al backend

const AUTH_TOKEN_KEY = "authToken";  // Nombre de la clave para guardar el JWT
const USER_DATA_KEY = "userData";    // Nombre de la clave para guardar info del usuario

export default function AdminLogin() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(""); // Ahora es identifier (email o username)
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Nuevo estado para deshabilitar botón (inicio sesion) mientras carga

  // Si ya está autenticado, redirigir
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY); 
    if (token) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Activamos estado de carga

    try { //
      const res = await axios.post("/api/admin/login", { // Enviamos credenciales al backend
        identifier,
        password,
      });

      // Guardamos token y datos del usuario
      localStorage.setItem(AUTH_TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(res.data.user));

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      const msg = err.response?.data?.error || "Error al iniciar sesión";
      setError(msg); // Se muestra el error del backend
    } finally {
      setLoading(false); // Siempre desactivamos loading, incluso si falla
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: 420,
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,.12)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <img src="/LOGO DEL CASTILLO.png" alt="Logo" style={{ height: 54 }} />
        </div>
        <h3 style={{ textAlign: "center", marginBottom: 12 }}>
          Acceso Administrador
        </h3>

        <input
          placeholder="Email o usuario" // Ahora acepta email o username
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            marginBottom: 10,
            boxSizing: "border-box",
          }}
          disabled={loading} // Deshabilita input mientras carga
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            marginBottom: 12,
            boxSizing: "border-box",
          }}
          disabled={loading}
        />

        {error && <p style={{ color: "#d63031", marginBottom: 8 }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #eaa25c",
            background: loading ? "#ccc" : "#FFB86B",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Iniciando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}