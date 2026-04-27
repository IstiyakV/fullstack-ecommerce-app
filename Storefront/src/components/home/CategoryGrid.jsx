import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1/customer', '') || '';

function resolveImage(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
}

export default function CategoryGrid({ categories = [] }) {
  if (!categories.length) return null;

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Categories</h2>
        <Link to="/products" className="section-link">View All →</Link>
      </div>
      <div className="category-grid">
        {categories.map(cat => (
          <Link
            key={cat.parent_category_id}
            to={`/products?category=${cat.parent_category_id}`}
            className="category-grid__item"
          >
            <div className="category-grid__icon">
              {cat.featured_image ? (
                <img src={resolveImage(cat.featured_image)} alt={cat.parent_category_name_en} />
              ) : (
                <span style={{ fontSize: '1.5rem' }}>📦</span>
              )}
            </div>
            <span className="category-grid__name">{cat.parent_category_name_en}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
