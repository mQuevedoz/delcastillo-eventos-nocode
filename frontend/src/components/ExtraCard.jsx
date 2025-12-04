export default function ExtraCard({ extra, onOpen }) {
  const cover = (extra.images || []).find(i => i.isCover) || (extra.images || [])[0];

  return (
    <article className="card service-card">
      <div className="service-card__media">
        <img
          src={cover?.url || "/corporativo1.jpg"}
          alt={extra.name}
          style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 12 }}
        />
      </div>

      <div className="service-card__body">
        <h4 className="service-card__title">{extra.name}</h4>

        <div className="chips" style={{ marginBottom: 6 }}>
          <span className="chip">Precio ref.: S/ {Number(extra.price || 0).toFixed(2)}</span>
        </div>

        <p className="service-card__desc" title={extra.description}>
          {extra.description?.length > 100
            ? `${extra.description.slice(0, 100)}…`
            : extra.description}
        </p>

        <button className="btn btn-primary" onClick={onOpen}>
          Ver detalle
        </button>
      </div>
    </article>
  );
}
