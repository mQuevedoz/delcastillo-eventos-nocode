// src/pages/ServicesPage.jsx
import { useEffect, useState } from "react";
import ServiceCard from "../components/ServiceCard.jsx";
import { listServices } from "../api/services.js";

const CATEGORIES = ["Todos", "Boda", "Corporativo", "Cumpleaños", "Otro"];

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");

  useEffect(() => {
    setLoading(true);
    listServices(q)
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [q]);

  const filtered = services.filter((s) => (cat === "Todos" ? true : s.category === cat));

  return (
    <>
      {/* HERO de inicio */}
      <section className="hero-wrap">
        <div className="hero">
          <div className="hero-inner">
            <h1>Organizamos el evento que imaginas</h1>
            <p className="hero-sub">
              Servicios para bodas, corporativos y celebraciones. Cotiza fácil y rápido.
            </p>
            <div className="hero-cta">
              <a className="btn-outline" href="#catalogo">Ver servicios</a>
              <a className="btn-primary" href="https://wa.me/51961212121" target="_blank" rel="noreferrer">
                Cotizar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <div id="catalogo" className="container page-content">
        <h2>Catálogo de Servicios</h2>
        <p className="muted" style={{ marginTop: -6 }}>
          Los precios mostrados son referenciales y pueden variar según los requerimientos específicos de cada cliente.
        </p>

        <div className="header" style={{ marginTop: 12 }}>
          <div className="filters">
            <input
              placeholder="Buscar por nombre..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="grid">
            {filtered.length === 0 && <p>No hay resultados.</p>}
            {filtered.map((s) => (
              <ServiceCard key={s._id} service={s} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
