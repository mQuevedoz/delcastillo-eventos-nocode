// src/pages/Contacto.jsx
import { useState } from "react";
import { createLead } from "../api/services";
import { FaInstagram, FaFacebook } from "react-icons/fa";

export default function Contacto() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk(false);

    if (!form.name || !form.email || !form.message) {
      setErr("Por favor completa tu nombre, correo y el mensaje.");
      return;
    }

    try {
      setLoading(true);
      await createLead(form);
      setOk(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        service: "",
        date: "",
        message: "",
      });
    } catch (e) {
      setErr(e.message || "Ocurrió un error al enviar tu solicitud.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* HERO (compacto) */}
      <section className="hero-wrap">
        <div className="hero hero-sm">
          <div className="hero-inner">
            <h1>Contacto</h1>
            <p className="hero-sub">
              Cuéntanos qué necesitas y te ayudamos con la organización de tu evento.
            </p>
          </div>
        </div>
      </section>

      {/* GRID DE CONTACTO: DEBE MATCHEAR CON TU CSS (.contact-grid) */}
      <div className="container page-content">
        <div className="contact-grid">
          {/* Columna izquierda: FORM */}
          <div className="box form">
            <h2 style={{ marginTop: 0 }}>Solicitar cotización</h2>

            <form className="form" onSubmit={onSubmit}>
              <div className="row">
                <label htmlFor="name">Nombre y apellido *</label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Tu nombre"
                  type="text"
                  autoComplete="name"
                />
              </div>

              <div className="row">
                <label htmlFor="email">Correo electrónico *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="tucorreo@dominio.com"
                  autoComplete="email"
                />
              </div>

              <div className="row">
                <label htmlFor="phone">Teléfono</label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="+51 9XX XXX XXX"
                  type="tel"
                  autoComplete="tel"
                />
              </div>

              {/* Fila doble → se apila en mobile por CSS (.row.two) */}
              <div className="row two">
                <div className="row">
                  <label htmlFor="service">Tipo de servicio</label>
                  <select
                    id="service"
                    name="service"
                    value={form.service}
                    onChange={onChange}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Boda">Boda</option>
                    <option value="Corporativo">Corporativo</option>
                    <option value="Cumpleaños">Cumpleaños</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="row">
                  <label htmlFor="date">Fecha del evento</label>
                  <input
                    id="date"
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="row">
                <label htmlFor="message">Mensaje *</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={onChange}
                  placeholder="Cuéntanos detalles: lugar, cantidad de personas, ideas, etc."
                />
              </div>

              {err && <div className="err">{err}</div>}
              {ok && (
                <div style={{ color: "#2f9e44", fontWeight: 600 }}>
                  ¡Gracias! Te escribiremos pronto.
                </div>
              )}

              <button className="btn btn-primary" disabled={loading}>
                {loading ? "Enviando..." : "Enviar solicitud"}
              </button>
            </form>
          </div>

          {/* Columna derecha: stack de tarjetas */}
          <div className="side-col" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Datos de contacto */}
            <aside className="box">
              <h3 style={{ marginTop: 0 }}>Datos de contacto</h3>
              <p className="muted" style={{ marginTop: -6 }}>
                Puedes escribirnos por correo o WhatsApp. ¡Responderemos lo antes posible!
              </p>

              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                <div>
                  <strong>Correo:</strong>
                  <div>
                    <a className="link" href="mailto:delcastilloeventos.jf@gmail.com">
                      delcastilloeventos.jf@gmail.com
                    </a>
                  </div>
                </div>

                <div>
                  <strong>WhatsApp:</strong>
                  <div>
                    <a
                      className="link"
                      href="https://wa.me/51961212121"
                      target="_blank"
                      rel="noreferrer"
                    >
                      +51 961 212 121
                    </a>
                  </div>
                </div>

                <div>
                  <h4>Horario de atención</h4>
                  <ul className="muted" style={{ paddingLeft: 18 }}>
                    <li>Lunes a Viernes: 9:00 am – 8:00 pm</li>
                    <li>Sábados y Domingos: 11:00 am – 6:00 pm</li>
                  </ul>

                  <h4>Síguenos</h4>
                  <div className="social-links" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <a
                      href="https://www.instagram.com/delcastillo_eventos/"
                      target="_blank"
                      rel="noreferrer"
                      className="social-link"
                      aria-label="Instagram"
                    >
                      <FaInstagram size={28} color="#E1306C" />
                    </a>

                    <a
                      href="https://www.facebook.com/profile.php?id=61572158499476"
                      target="_blank"
                      rel="noreferrer"
                      className="social-link"
                      aria-label="Facebook"
                    >
                      <FaFacebook size={28} color="#1877F2" />
                    </a>
                  </div>
                </div>

                <a
                  className="btn-outline"
                  href="https://wa.me/51961212121"
                  target="_blank"
                  rel="noreferrer"
                >
                  Escribir por WhatsApp
                </a>
              </div>
            </aside>

            {/* ¿Por qué elegirnos? */}
            <aside className="box">
              <h3 style={{ marginTop: 0 }}>¿Por qué elegirnos?</h3>
              <ul style={{ paddingLeft: 18, margin: "8px 0 0", lineHeight: 1.6 }}>
                <li>Asesoría personalizada y respuesta rápida</li>
                <li>Presupuestos a medida y transparentes</li>
                <li>Experiencia en bodas, corporativos y sociales</li>
                <li>Red de proveedores confiables</li>
              </ul>
            </aside>

            {/* Preguntas frecuentes */}
            <aside className="box">
              <h3 style={{ marginTop: 0 }}>Preguntas frecuentes</h3>

              <details style={{ marginBottom: 10 }}>
                <summary className="link">¿En cuánto tiempo responden?</summary>
                <p className="muted" style={{ marginTop: 6 }}>
                  Normalmente dentro del mismo día hábil. Si es urgente, escríbenos por WhatsApp.
                </p>
              </details>

              <details style={{ marginBottom: 10 }}>
                <summary className="link">¿Puedo pedir un presupuesto sin compromiso?</summary>
                <p className="muted" style={{ marginTop: 6 }}>
                  ¡Claro! Envíanos los detalles de tu evento y te proponemos opciones.
                </p>
              </details>

              <details>
                <summary className="link">¿Trabajan fuera de la ciudad?</summary>
                <p className="muted" style={{ marginTop: 6 }}>
                  Sí, coordinamos logística y desplazamiento según el proyecto.
                </p>
              </details>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
