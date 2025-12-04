import { NavLink, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./header.css";
import 'boxicons/css/boxicons.min.css';


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const ddRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cerrar dropdown al hacer click fuera o presionar ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setServicesOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="container">
          <span>delcastilloeventos.jf@gmail.com</span>
          <div className="contact-inline">
            <a href="https://wa.me/51961212121" target="_blank" rel="noreferrer">
              WhatsApp: +51 961 212 121
            </a>
          </div>
        </div>
      </div>

      {/* NAV PRINCIPAL */}
      <div className="navwrap">
        <div className="container navline">
          <Link to="/" className="logo" onClick={() => { setMobileOpen(false); setServicesOpen(false); }}>
            <img src="/LOGO DEL CASTILLO.png" alt="Del Castillo Eventos" />
          </Link>

          <nav className={`menu ${mobileOpen ? "open" : ""}`}>
            <NavLink to="/" end onClick={() => { setMobileOpen(false); setServicesOpen(false); }}>
              Inicio
            </NavLink>
            <NavLink to="/extras" onClick={() => setMobileOpen(false)}>
            Extras
            </NavLink>
            <NavLink to="/casas" onClick={() => setMobileOpen(false)}>
              Casas
            </NavLink>
            <NavLink to="/nosotros" onClick={() => { setMobileOpen(false); setServicesOpen(false); }}>
              Nosotros
            </NavLink>
            <NavLink to="/contacto" onClick={() => { setMobileOpen(false); setServicesOpen(false); }}>
              Contacto
            </NavLink>

            <a
              className="btn-cta"
              href="https://wa.me/51961212121"
              target="_blank"
              rel="noreferrer"
              onClick={() => { setMobileOpen(false); setServicesOpen(false); }}
            >
              Cotizar ahora
            </a>
          </nav>

          <button
            className={`hamburger ${mobileOpen ? "is-open" : ""}`}
            aria-label="Abrir menú"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
