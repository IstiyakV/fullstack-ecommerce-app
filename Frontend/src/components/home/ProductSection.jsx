import { Link } from 'react-router-dom';
import ProductCard from '../common/ProductCard';

export default function ProductSection({ title, products = [], link = '/products' }) {
  if (!products.length) return null;

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <Link to={link} className="section-link">VIEW ALL →</Link>
      </div>
      <div className="product-grid">
        {products.slice(0, 10).map(p => (
          <ProductCard key={p.product_id} product={p} />
        ))}
      </div>
    </div>
  );
}
