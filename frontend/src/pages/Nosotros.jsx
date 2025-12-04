// frontend/src/pages/Nosotros.jsx
export default function Nosotros() {
  return (
    <>
      {/* HERO */}
      <section className="hero-wrap">
        <div className="hero">
          <div className="hero-inner">
            <h1>Nosotros</h1>
            <p className="hero-sub">
              Somos un equipo especializado en la organización de bodas,
              eventos corporativos y celebraciones. Cuidamos cada detalle
              para que tu evento sea impecable.
            </p>
            <div className="hero-cta">
              <a className="btn-primary" href="contacto">Quiero cotizar</a>
              <a className="btn-outline" href="https://wa.me/51961212121" target="_blank" rel="noreferrer">
                Escríbenos por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENIDO */}
      <div className="container page-content">
        <div className="about-grid">
          <div className="box">
            <h2>Nuestra historia</h2>
            <p>
              Nacimos con el propósito de crear experiencias memorables.
              Combinamos creatividad, planificación y una red de proveedores
              confiables para diseñar eventos únicos a la medida.
            </p>
            <ul className="bullets">
              <li>Asesoría integral y personalizada.</li>
              <li>Gestión de proveedores y logística completa.</li>
              <li>Montaje y coordinación el día del evento.</li>
            </ul>
          </div>

          <div className="box">
            <h2>Lo que nos define</h2>
            <div className="chips">
              <span className="chip">Compromiso</span>
              <span className="chip">Creatividad</span>
              <span className="chip">Puntualidad</span>
              <span className="chip">Transparencia</span>
            </div>
            <div className="stats">
              <div className="stat">
                <div className="stat-num">+120</div>
                <div className="stat-label">Eventos realizados</div>
              </div>
              <div className="stat">
                <div className="stat-num">+60</div>
                <div className="stat-label">Bodas</div>
              </div>
              <div className="stat">
                <div className="stat-num">+50</div>
                <div className="stat-label">Corporativos</div>
              </div>
            </div>
          </div>
        </div>

        <h2 style={{marginTop: 32}}>Algunos de nuestros momentos</h2>
        <div className="gallery">
          <img src="/corporativo1.jpg" alt="Evento corporativo" />
          <img src="/boda1.jpeg" alt="Boda" />
          <div className="gallery-ph">Pronto más fotos…</div>
        </div>

        <div id="contacto" className="cta-box">
          <h3>¿Listo para tu evento?</h3>
          <p>Cuéntanos tu idea y armamos una propuesta a medida.</p>
          <div className="hero-cta">
            <a className="btn-outline" href="https://wa.me/51961212121" target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </div>
      </div>
    </>
  );
}
