import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/common/ProductCard';

export default function Wishlist() {
  const { items, removeItem } = useWishlist();

  return (
    <div className="container" style={{ padding: '24px 16px', minHeight: '60vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <FiHeart size={24} color="var(--sm-primary)" />
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>My Wishlist</h1>
        <span style={{ fontSize: '0.875rem', color: 'var(--sm-text-muted)', background: 'var(--sm-bg)', padding: '4px 12px', borderRadius: '16px' }}>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', border: '1px solid var(--sm-border-light)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--sm-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <FiHeart size={32} color="var(--sm-text-muted)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Your wishlist is empty</h2>
          <p style={{ color: 'var(--sm-text-muted)', marginBottom: '24px' }}>Save items you love to review or shop later.</p>
          <Link to="/products" className="btn btn-primary" style={{ display: 'inline-flex', padding: '10px 24px' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
          {items.map(product => (
            <div key={product.product_id} style={{ position: 'relative' }}>
              <ProductCard product={product} />
              <button
                onClick={(e) => { e.preventDefault(); removeItem(product.product_id); }}
                style={{
                  position: 'absolute', top: '10px', right: '10px', width: '32px', height: '32px',
                  borderRadius: '50%', background: '#fff', border: '1px solid #fecaca', color: '#dc2626',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10, transition: 'all 0.2s'
                }}
                title="Remove from wishlist"
                onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
