export default function PageHero({ title, subtitle }) {
  return (
    <section className="page-hero">
      <div className="container">
        <h2 className="mb-2">{title}</h2>
        {subtitle && <p className="text-muted m-0">{subtitle}</p>}
      </div>
    </section>
  );
}
