const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1/customer', '') || '';

function resolveImage(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
}

export default function BrandRow({ brands = [] }) {
  if (!brands.length) return null;

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Official Brands</h2>
      </div>
      <div className="brand-row">
        {brands.map(b => (
          <div key={b.brand_id} className="brand-row__item" title={b.category_name_en}>
            {b.brand_image ? (
              <img src={resolveImage(b.brand_image)} alt={b.category_name_en} />
            ) : (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sm-text-secondary)' }}>{b.category_name_en}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
