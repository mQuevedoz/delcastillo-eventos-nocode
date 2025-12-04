import { useEffect, useState } from 'react';
import { listarCasas } from '../api/casas';
import PageHero from '../components/PageHero';
import CasaGalleryModal from '../components/CasaGalleryModal';

function CasaCard({ casa, onOpen }) {
  const img = casa.imagenes?.[0]?.url || '/boda1.jpeg';
  return (
    <div className="card shadow-sm house-card">
      <img src={img} className="card-img-top" alt={casa.nombre} />
      <div className="card-body">
        <h5 className="card-title mb-1 house-title">{casa.nombre}</h5>
        <div className="text-muted small mb-2">{casa.direccion}</div>
        <ul className="house-meta">
          <li><strong>Área:</strong> {casa.areaM2} m²</li>
          <li><strong>Capacidad:</strong> {casa.capacidad} personas</li>
          <li><strong>Horario máx.:</strong> {casa.horaFinEvento}</li>
        </ul>
        {typeof casa.precioDesde === 'number' && (
          <div className="fw-semibold mb-2">Desde: S/ {casa.precioDesde}</div>
        )}
        <button className="btn btn-warning text-white" onClick={() => onOpen(casa)}>
          Ver detalle
        </button>
      </div>
    </div>
  );
}

export default function CasasPage() {
  const [casas, setCasas] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  async function load(filter = '') {
    try {
      setError('');
      setLoading(true);
      const data = await listarCasas(filter);

      // 🔹 Filtramos solo las activas
      const activas = data.filter(c => c.activa === true);
      setCasas(activas);
    } catch {
      setError('No se pudieron cargar las casas.');
    } finally {
      setLoading(false);
    }
  }

  // Búsqueda en vivo (con debounce)
  useEffect(() => {
    const t = setTimeout(() => load(q), 300); // 300 ms
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => { load(); }, []);

  function openModal(casa) {
    setSelected(casa);
    setOpen(true);
  }

  return (
    <>
      <PageHero
        title="Nuestras Casas"
        subtitle="Aquí encontrarás nuestras casas disponibles para tus eventos."
      />

      <div className="container casas-wrapper">
        <div className="casas-filtros">
          <input
            className="form-control"
            placeholder="Buscar por nombre..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {/* El botón se mantiene, por si el usuario prefiere click */}
          <button className="btn btn-dark" onClick={() => load(q)}>Buscar</button>
        </div>

        {loading && <p>Cargando...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && (
          casas.length ? (
            <div className="casas-grid">
              {casas.map(c => <CasaCard key={c._id} casa={c} onOpen={openModal} />)}
            </div>
          ) : (
            <p className="text-muted">Aún no hay casas activas disponibles.</p>
          )
        )}
      </div>

      <CasaGalleryModal open={open} onClose={() => setOpen(false)} casa={selected} />
    </>
  );
}
