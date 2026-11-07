import type { LiveGuide } from './StorePage';

export default function FeaturedResources({ guides }: { guides: LiveGuide[] }) {
  return (
    <section className="wrap featured" id="resources">
      <div className="section-head">
        <div>
          <div className="kicker">The resource shelf</div>
          <h2>Start with a free guide.</h2>
        </div>
        <p>Practical resources for learning AI.</p>
      </div>
      <div className="resources">
        {guides.length > 0 ? guides.map(r => (
          <a className="resource" href={r.publicUrl || '#resources'} key={r.id}
             target={r.publicUrl && r.publicUrl !== '#resources' ? '_blank' : undefined}
             rel={r.publicUrl && r.publicUrl !== '#resources' ? 'noopener noreferrer' : undefined}>
            <img src={r.img} alt={`${r.title} resource photo`} loading="lazy" />
            <div>
              <div className="reslabel">{r.label}</div>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
            </div>
            <span className="arrow">↗</span>
          </a>
        )) : (
          <p style={{ gridColumn: '1/-1', color: 'var(--muted)', fontSize: 12, padding: '20px 0' }}>
            Free guides coming soon.
          </p>
        )}
      </div>
      <a className="more" href="#resources">Browse all free guides&nbsp;→</a>
    </section>
  );
}
